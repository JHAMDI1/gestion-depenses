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

// Mutation: Créer une nouvelle dépense récurrente
export const createRecurring = mutation({
    args: {
        categoryId: v.id("categories"),
        name: v.string(),
        amount: v.number(),
        dayOfMonth: v.number(), // 1-31
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        // Vérifier que la catégorie appartient à l'utilisateur
        const category = await ctx.db.get(args.categoryId);
        if (!category || category.userId !== identity.subject) {
            throw new Error("Catégorie invalide");
        }

        // Valider le jour du mois
        if (args.dayOfMonth < 1 || args.dayOfMonth > 31) {
            throw new Error("Jour du mois invalide (doit être entre 1 et 31)");
        }

        return await ctx.db.insert("recurrings", {
            userId: identity.subject,
            categoryId: args.categoryId,
            name: args.name,
            amount: args.amount,
            dayOfMonth: args.dayOfMonth,
            isActive: true,
        });
    },
});

// Mutation: Mettre à jour une dépense récurrente
export const updateRecurring = mutation({
    args: {
        id: v.id("recurrings"),
        categoryId: v.id("categories"),
        name: v.string(),
        amount: v.number(),
        dayOfMonth: v.number(),
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

        // Valider le jour du mois
        if (args.dayOfMonth < 1 || args.dayOfMonth > 31) {
            throw new Error("Jour du mois invalide (doit être entre 1 et 31)");
        }

        await ctx.db.patch(args.id, {
            categoryId: args.categoryId,
            name: args.name,
            amount: args.amount,
            dayOfMonth: args.dayOfMonth,
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
