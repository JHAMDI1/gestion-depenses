import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query: Obtenir toutes les dettes de l'utilisateur
export const getDebts = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const debts = await ctx.db
            .query("debts")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();

        return debts.map((debt) => ({
            ...debt,
            isOverdue: debt.dueDate && debt.dueDate < Date.now() && !debt.isPaid,
        }));
    },
});

// Mutation: Créer une nouvelle dette
export const createDebt = mutation({
    args: {
        personName: v.string(),
        amount: v.number(),
        type: v.string(), // "LENT" ou "BORROWED"
        dueDate: v.optional(v.number()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        return await ctx.db.insert("debts", {
            userId: identity.subject,
            personName: args.personName,
            amount: args.amount,
            type: args.type,
            dueDate: args.dueDate,
            isPaid: false,
            description: args.description,
            createdAt: Date.now(),
        });
    },
});

// Mutation: Mettre à jour une dette
export const updateDebt = mutation({
    args: {
        id: v.id("debts"),
        personName: v.string(),
        amount: v.number(),
        type: v.string(),
        dueDate: v.optional(v.number()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const debt = await ctx.db.get(args.id);
        if (!debt || debt.userId !== identity.subject) {
            throw new Error("Dette non trouvée");
        }

        await ctx.db.patch(args.id, {
            personName: args.personName,
            amount: args.amount,
            type: args.type,
            dueDate: args.dueDate,
            description: args.description,
        });
    },
});

// Mutation: Basculer le statut de paiement
export const togglePaid = mutation({
    args: {
        id: v.id("debts"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const debt = await ctx.db.get(args.id);
        if (!debt || debt.userId !== identity.subject) {
            throw new Error("Dette non trouvée");
        }

        await ctx.db.patch(args.id, {
            isPaid: !debt.isPaid,
        });
    },
});

// Mutation: Supprimer une dette
export const deleteDebt = mutation({
    args: {
        id: v.id("debts"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const debt = await ctx.db.get(args.id);
        if (!debt || debt.userId !== identity.subject) {
            throw new Error("Dette non trouvée");
        }

        await ctx.db.delete(args.id);
    },
});
