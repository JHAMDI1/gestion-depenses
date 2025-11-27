import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query: Obtenir tous les objectifs de l'utilisateur
export const getGoals = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const goals = await ctx.db
            .query("goals")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();

        return goals.map((goal) => ({
            ...goal,
            percentage: (goal.savedAmount / goal.targetAmount) * 100,
            remaining: goal.targetAmount - goal.savedAmount,
            isCompleted: goal.savedAmount >= goal.targetAmount,
        }));
    },
});

// Mutation: Créer un nouvel objectif
export const createGoal = mutation({
    args: {
        name: v.string(),
        targetAmount: v.number(),
        deadline: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        return await ctx.db.insert("goals", {
            userId: identity.subject,
            name: args.name,
            targetAmount: args.targetAmount,
            savedAmount: 0,
            deadline: args.deadline,
            createdAt: Date.now(),
        });
    },
});

// Mutation: Mettre à jour l'épargne d'un objectif
export const updateSavedAmount = mutation({
    args: {
        id: v.id("goals"),
        savedAmount: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const goal = await ctx.db.get(args.id);
        if (!goal || goal.userId !== identity.subject) {
            throw new Error("Objectif non trouvé");
        }

        await ctx.db.patch(args.id, {
            savedAmount: args.savedAmount,
        });
    },
});

// Mutation: Ajouter de l'épargne à un objectif
export const addSavings = mutation({
    args: {
        id: v.id("goals"),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const goal = await ctx.db.get(args.id);
        if (!goal || goal.userId !== identity.subject) {
            throw new Error("Objectif non trouvé");
        }

        await ctx.db.patch(args.id, {
            savedAmount: goal.savedAmount + args.amount,
        });
    },
});

// Mutation: Retirer de l'épargne d'un objectif
export const withdrawSavings = mutation({
    args: {
        id: v.id("goals"),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const goal = await ctx.db.get(args.id);
        if (!goal || goal.userId !== identity.subject) {
            throw new Error("Objectif non trouvé");
        }

        const newAmount = Math.max(0, goal.savedAmount - args.amount);
        await ctx.db.patch(args.id, {
            savedAmount: newAmount,
        });
    },
});

// Mutation: Mettre à jour un objectif complet
export const updateGoal = mutation({
    args: {
        id: v.id("goals"),
        name: v.string(),
        targetAmount: v.number(),
        savedAmount: v.number(),
        deadline: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const goal = await ctx.db.get(args.id);
        if (!goal || goal.userId !== identity.subject) {
            throw new Error("Objectif non trouvé");
        }

        await ctx.db.patch(args.id, {
            name: args.name,
            targetAmount: args.targetAmount,
            savedAmount: args.savedAmount,
            deadline: args.deadline,
        });
    },
});

// Mutation: Supprimer un objectif
export const deleteGoal = mutation({
    args: {
        id: v.id("goals"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const goal = await ctx.db.get(args.id);
        if (!goal || goal.userId !== identity.subject) {
            throw new Error("Objectif non trouvé");
        }

        await ctx.db.delete(args.id);
    },
});
