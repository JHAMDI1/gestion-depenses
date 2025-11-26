import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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

        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        return { total, count: transactions.length };
    },
});

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

        // Vérifier que la catégorie appartient à l'utilisateur
        const category = await ctx.db.get(args.categoryId);
        if (!category || category.userId !== identity.subject) {
            throw new Error("Catégorie invalide");
        }

        return await ctx.db.insert("transactions", {
            userId: identity.subject,
            categoryId: args.categoryId,
            name: args.name,
            amount: args.amount,
            type: args.type || "EXPENSE", // Par défaut EXPENSE pour compatibilité
            date: args.date,
            createdAt: Date.now(),
        });
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

        const transaction = await ctx.db.get(args.id);
        if (!transaction || transaction.userId !== identity.subject) {
            throw new Error("Transaction non trouvée");
        }

        // Vérifier que la catégorie appartient à l'utilisateur
        const category = await ctx.db.get(args.categoryId);
        if (!category || category.userId !== identity.subject) {
            throw new Error("Catégorie invalide");
        }

        await ctx.db.patch(args.id, {
            categoryId: args.categoryId,
            name: args.name,
            amount: args.amount,
            type: args.type || "EXPENSE",
            date: args.date,
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

        const transaction = await ctx.db.get(args.id);
        if (!transaction || transaction.userId !== identity.subject) {
            throw new Error("Transaction non trouvée");
        }

        await ctx.db.delete(args.id);
    },
});
