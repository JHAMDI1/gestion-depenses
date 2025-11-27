import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query: Obtenir le solde initial de l'utilisateur
export const getInitialBalance = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const balance = await ctx.db
            .query("balance")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        return balance || null;
    },
});

// Query: Calculer le solde actuel complet
export const getCurrentBalance = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        // 1. Solde initial
        const balanceDoc = await ctx.db
            .query("balance")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        const initialAmount = balanceDoc?.initialAmount || 0;

        // 2. Total revenus (transactions INCOME)
        const allTransactions = await ctx.db
            .query("transactions")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();

        const totalIncome = allTransactions
            .filter(t => t.type === "INCOME")
            .reduce((sum, t) => sum + t.amount, 0);

        // 3. Total dépenses (transactions EXPENSE ou sans type)
        const totalExpenses = allTransactions
            .filter(t => !t.type || t.type === "EXPENSE")
            .reduce((sum, t) => sum + t.amount, 0);

        // 4. Dettes
        const allDebts = await ctx.db
            .query("debts")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();

        const unpaidDebts = allDebts.filter(d => !d.isPaid);
        const totalBorrowed = unpaidDebts
            .filter(d => d.type === "BORROWED")
            .reduce((sum, d) => sum + d.amount, 0);

        const totalLent = unpaidDebts
            .filter(d => d.type === "LENT")
            .reduce((sum, d) => sum + d.amount, 0);

        // 5. Épargne (objectifs)
        const allGoals = await ctx.db
            .query("goals")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();

        const totalSavings = allGoals.reduce((sum, g) => sum + g.savedAmount, 0);

        // Calcul final
        const currentBalance = initialAmount + totalIncome - totalExpenses + totalBorrowed - totalLent - totalSavings;

        return {
            currentBalance,
            details: {
                initialAmount,
                totalIncome,
                totalExpenses,
                totalBorrowed,
                totalLent,
                totalSavings,
            },
        };
    },
});

// Mutation: Définir ou mettre à jour le solde initial
export const setInitialBalance = mutation({
    args: {
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const existing = await ctx.db
            .query("balance")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        if (existing) {
            // Mettre à jour
            await ctx.db.patch(existing._id, {
                initialAmount: args.amount,
                updatedAt: Date.now(),
            });
        } else {
            // Créer
            await ctx.db.insert("balance", {
                userId: identity.subject,
                initialAmount: args.amount,
                currency: "TND",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
    },
});
