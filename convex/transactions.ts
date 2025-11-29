import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { transactionSchema } from "../lib/validation";
import { validateWithZod, checkRateLimit, logAudit } from "./helpers/security";

// Query: Obtenir toutes les transactions de l'utilisateur
export const getTransactions = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .take(args.limit ?? 100);

        // Enrichir avec les informations de catégorie
        return await Promise.all(
            transactions.map(async (transaction) => {
                const category = await ctx.db.get(transaction.categoryId);
                return {
                    ...transaction,
                    category,
                };
            })
        );
    },
});

// Query: Obtenir les transactions récentes (10 dernières)
export const getRecentTransactions = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .take(10);

        return await Promise.all(
            transactions.map(async (transaction) => {
                const category = await ctx.db.get(transaction.categoryId);
                return {
                    ...transaction,
                    category,
                };
            })
        );
    },
});

// Query: Obtenir les transactions avec les dettes
export const getTransactionsWithDebts = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        // 1. Récupérer les transactions normales
        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .take(args.limit ?? 100);

        // Enrichir avec les catégories
        const enrichedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                const category = await ctx.db.get(transaction.categoryId);
                return {
                    ...transaction,
                    category,
                    isDebt: false,
                };
            })
        );

        // 2. Récupérer toutes les dettes (payées et non payées)
        const debts = await ctx.db
            .query("debts")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();

        // 3. Convertir les dettes en format transaction
        const debtTransactions = debts.flatMap((debt) => {
            const transactions = [];

            // Créer une "transaction" pour la création de la dette
            // BORROWED (emprunté) → affiche comme INCOME (vert, +solde)
            // LENT (prêté) → affiche comme EXPENSE (rouge, -solde)
            const creationType = debt.type === "BORROWED" ? "INCOME" : "EXPENSE";
            const creationName = debt.type === "BORROWED"
                ? `💰 Argent emprunté de ${debt.personName}`
                : `💸 Argent prêté à ${debt.personName}`;

            transactions.push({
                _id: `${debt._id}_created` as any,
                _creationTime: debt.createdAt,
                userId: debt.userId,
                name: creationName,
                amount: debt.amount,
                type: creationType,
                date: debt.createdAt,
                createdAt: debt.createdAt,
                isDebt: true,
                debtId: debt._id,
                debtType: debt.type,
                debtPerson: debt.personName,
                isPaid: debt.isPaid,
                description: debt.description,
            });

            // Si la dette est payée, créer une "transaction" pour le remboursement
            // BORROWED payé → EXPENSE (rouge, -solde) car on rembourse
            // LENT payé → INCOME (vert, +solde) car on reçoit le remboursement
            if (debt.isPaid) {
                const paymentType = debt.type === "BORROWED" ? "EXPENSE" : "INCOME";
                const paymentName = debt.type === "BORROWED"
                    ? `💳 Remboursement à ${debt.personName}`
                    : `💵 Remboursement de ${debt.personName}`;

                transactions.push({
                    _id: `${debt._id}_paid` as any,
                    _creationTime: debt.createdAt,
                    userId: debt.userId,
                    name: paymentName,
                    amount: debt.amount,
                    type: paymentType,
                    // Utilise la date de creation + 1ms pour le tri (simule le paiement après création)
                    date: debt.createdAt + 1,
                    createdAt: debt.createdAt,
                    isDebt: true,
                    debtId: debt._id,
                    debtType: debt.type,
                    debtPerson: debt.personName,
                    isPaid: debt.isPaid,
                    description: debt.description,
                    isPayment: true,
                });
            }

            return transactions;
        });

        // 4. Fusionner et trier par date
        const combined = [...enrichedTransactions, ...debtTransactions]
            .sort((a, b) => b.date - a.date)
            .slice(0, args.limit ?? 100);

        return combined;
    },
});

// Query: Obtenir les transactions d'un mois spécifique
export const getTransactionsByMonth = query({
    args: {
        year: v.number(),
        month: v.number(), // 1-12
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        // Calculer les timestamps de début et fin du mois
        const startDate = new Date(args.year, args.month - 1, 1).getTime();
        const endDate = new Date(args.year, args.month, 0, 23, 59, 59).getTime();

        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", identity.subject)
                    .gte("date", startDate)
                    .lte("date", endDate)
            )
            .collect();

        return await Promise.all(
            transactions.map(async (transaction) => {
                const category = await ctx.db.get(transaction.categoryId);
                return {
                    ...transaction,
                    category,
                };
            })
        );
    },
});

// Query: Obtenir le total des dépenses du mois en cours
export const getMonthlyTotal = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", identity.subject)
                    .gte("date", startDate)
                    .lte("date", endDate)
            )
            .collect();

        // Filtrer uniquement les dépenses (ignorer les revenus)
        const expenses = transactions.filter(t => !t.type || t.type === "EXPENSE");
        const total = expenses.reduce((sum, t) => sum + t.amount, 0);
        return { total, count: expenses.length };
    },
});

// Mutation: Créer une nouvelle transaction
// Mutation: Créer une nouvelle transaction
export const createTransaction = mutation({
    args: {
        categoryId: v.id("categories"),
        name: v.string(),
        amount: v.number(),
        type: v.optional(v.string()), // "EXPENSE" ou "INCOME"
        date: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        // Validation Zod & Security
        try {

            // 1. Validation
            validateWithZod(transactionSchema, {
                categoryId: args.categoryId,
                name: args.name,
                amount: args.amount,
                type: args.type || "EXPENSE",
                date: args.date,
            });

            // 2. Rate Limiting
            await checkRateLimit(ctx, "createTransaction", identity.subject);

            // Vérifier que la catégorie appartient à l'utilisateur
            const category = await ctx.db.get(args.categoryId);
            if (!category || category.userId !== identity.subject) {
                throw new Error("Catégorie invalide");
            }

            // 3. Création
            const transactionId = await ctx.db.insert("transactions", {
                userId: identity.subject,
                categoryId: args.categoryId,
                name: args.name,
                amount: args.amount,
                type: args.type || "EXPENSE",
                date: args.date,
                createdAt: Date.now(),
            });

            // 4. Audit Log
            await logAudit(ctx, {
                userId: identity.subject,
                action: "createTransaction",
                resourceType: "transactions",
                resourceId: transactionId,
                details: { amount: args.amount, type: args.type },
            });

            return transactionId;
        } catch (error) {
            throw error;
        }
    },
});

// Mutation: Mettre à jour une transaction
export const updateTransaction = mutation({
    args: {
        id: v.id("transactions"),
        categoryId: v.id("categories"),
        name: v.string(),
        amount: v.number(),
        type: v.optional(v.string()),
        date: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        // 1. Validation
        validateWithZod(transactionSchema, {
            categoryId: args.categoryId,
            name: args.name,
            amount: args.amount,
            type: args.type || "EXPENSE",
            date: args.date,
        });

        // 2. Rate Limiting
        await checkRateLimit(ctx, "updateTransaction", identity.subject);

        const transaction = await ctx.db.get(args.id);
        if (!transaction || transaction.userId !== identity.subject) {
            throw new Error("Transaction non trouvée");
        }

        // Vérifier que la catégorie appartient à l'utilisateur
        const category = await ctx.db.get(args.categoryId);
        if (!category || category.userId !== identity.subject) {
            throw new Error("Catégorie invalide");
        }

        // 3. Update
        await ctx.db.patch(args.id, {
            categoryId: args.categoryId,
            name: args.name,
            amount: args.amount,
            type: args.type || "EXPENSE",
            date: args.date,
        });

        // 4. Audit Log
        await logAudit(ctx, {
            userId: identity.subject,
            action: "updateTransaction",
            resourceType: "transactions",
            resourceId: args.id,
            details: { amount: args.amount, type: args.type, previousAmount: transaction.amount },
        });
    },
});

// Mutation: Supprimer une transaction
export const deleteTransaction = mutation({
    args: {
        id: v.id("transactions"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        // Rate Limiting
        await checkRateLimit(ctx, "deleteTransaction", identity.subject);

        const transaction = await ctx.db.get(args.id);
        if (!transaction || transaction.userId !== identity.subject) {
            throw new Error("Transaction non trouvée");
        }

        await ctx.db.delete(args.id);

        // Audit Log
        await logAudit(ctx, {
            userId: identity.subject,
            action: "deleteTransaction",
            resourceType: "transactions",
            resourceId: args.id,
            details: { amount: transaction.amount },
        });
    },
});
