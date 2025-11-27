import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query: Obtenir toutes les dépenses récurrentes de l'utilisateur
export const getRecurrings = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const recurrings = await ctx.db
            .query("recurrings")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();

        // Enrichir avec les informations de catégorie
        return await Promise.all(
            recurrings.map(async (recurring) => {
                const category = await ctx.db.get(recurring.categoryId);
                return {
                    ...recurring,
                    category,
                };
            })
        );
    },
});

// Mutation: Créer une nouvelle dépense/revenu récurrent(e)
export const createRecurring = mutation({
    args: {
        categoryId: v.id("categories"),
        name: v.string(),
        amount: v.number(),
        type: v.optional(v.string()),      // "EXPENSE" ou "INCOME"
        frequency: v.optional(v.string()), // "DAILY", "WEEKLY", "MONTHLY", etc.
        dayOfWeek: v.optional(v.number()), // 0-6 pour hebdomadaire
        dayOfMonth: v.optional(v.number()), // 1-31 pour mensuel
        startDate: v.optional(v.number()), // Timestamp de début
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        // Vérifier que la catégorie appartient à l'utilisateur
        const category = await ctx.db.get(args.categoryId);
        if (!category || category.userId !== identity.subject) {
            throw new Error("Catégorie invalide");
        }

        // Validation conditionnelle selon la fréquence
        const frequency = args.frequency || "MONTHLY";

        if ((frequency === "WEEKLY" || frequency === "BIWEEKLY") && args.dayOfWeek !== undefined) {
            if (args.dayOfWeek < 0 || args.dayOfWeek > 6) {
                throw new Error("Jour de la semaine invalide (doit être entre 0 et 6)");
            }
        }

        if (args.dayOfMonth !== undefined && (args.dayOfMonth < 1 || args.dayOfMonth > 31)) {
            throw new Error("Jour du mois invalide (doit être entre 1 et 31)");
        }

        return await ctx.db.insert("recurrings", {
            userId: identity.subject,
            categoryId: args.categoryId,
            name: args.name,
            amount: args.amount,
            type: args.type || "EXPENSE",
            frequency: frequency,
            dayOfWeek: args.dayOfWeek,
            dayOfMonth: args.dayOfMonth,
            startDate: args.startDate || Date.now(),
            isActive: true,
            createdAt: Date.now(),
        });
    },
});

// Mutation: Mettre à jour une dépense/revenu récurrent(e)
export const updateRecurring = mutation({
    args: {
        id: v.id("recurrings"),
        categoryId: v.id("categories"),
        name: v.string(),
        amount: v.number(),
        type: v.optional(v.string()),
        frequency: v.optional(v.string()),
        dayOfWeek: v.optional(v.number()),
        dayOfMonth: v.optional(v.number()),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const recurring = await ctx.db.get(args.id);
        if (!recurring || recurring.userId !== identity.subject) {
            throw new Error("Dépense récurrente non trouvée");
        }

        // Vérifier que la catégorie appartient à l'utilisateur
        const category = await ctx.db.get(args.categoryId);
        if (!category || category.userId !== identity.subject) {
            throw new Error("Catégorie invalide");
        }

        // Validations
        if (args.dayOfWeek !== undefined && (args.dayOfWeek < 0 || args.dayOfWeek > 6)) {
            throw new Error("Jour de la semaine invalide");
        }

        if (args.dayOfMonth !== undefined && (args.dayOfMonth < 1 || args.dayOfMonth > 31)) {
            throw new Error("Jour du mois invalide");
        }

        await ctx.db.patch(args.id, {
            categoryId: args.categoryId,
            name: args.name,
            amount: args.amount,
            type: args.type || "EXPENSE",
            frequency: args.frequency || "MONTHLY",
            dayOfWeek: args.dayOfWeek,
            dayOfMonth: args.dayOfMonth,
            isActive: args.isActive,
        });
    },
});

// Mutation: Activer/Désactiver une dépense récurrente
export const toggleRecurring = mutation({
    args: {
        id: v.id("recurrings"),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const recurring = await ctx.db.get(args.id);
        if (!recurring || recurring.userId !== identity.subject) {
            throw new Error("Dépense récurrente non trouvée");
        }

        await ctx.db.patch(args.id, {
            isActive: args.isActive,
        });
    },
});

// Mutation: Supprimer une dépense récurrente
export const deleteRecurring = mutation({
    args: {
        id: v.id("recurrings"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const recurring = await ctx.db.get(args.id);
        if (!recurring || recurring.userId !== identity.subject) {
            throw new Error("Dépense récurrente non trouvée");
        }

        await ctx.db.delete(args.id);
    },
});
