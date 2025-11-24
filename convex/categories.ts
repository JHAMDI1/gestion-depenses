import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query: Obtenir toutes les catégories de l'utilisateur
export const getCategories = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        return await ctx.db
            .query("categories")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();
    },
});

// Mutation: Créer une nouvelle catégorie
export const createCategory = mutation({
    args: {
        name: v.string(),
        icon: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        return await ctx.db.insert("categories", {
            userId: identity.subject,
            name: args.name,
            icon: args.icon,
            color: args.color,
        });
    },
});

// Mutation: Mettre à jour une catégorie
export const updateCategory = mutation({
    args: {
        id: v.id("categories"),
        name: v.string(),
        icon: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const category = await ctx.db.get(args.id);
        if (!category || category.userId !== identity.subject) {
            throw new Error("Catégorie non trouvée");
        }

        await ctx.db.patch(args.id, {
            name: args.name,
            icon: args.icon,
            color: args.color,
        });
    },
});

// Mutation: Supprimer une catégorie
export const deleteCategory = mutation({
    args: {
        id: v.id("categories"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const category = await ctx.db.get(args.id);
        if (!category || category.userId !== identity.subject) {
            throw new Error("Catégorie non trouvée");
        }

        await ctx.db.delete(args.id);
    },
});

// Mutation: Initialiser les catégories par défaut pour un nouvel utilisateur
export const seedDefaultCategories = mutation({
    args: {
        locale: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        // Vérifier si l'utilisateur a déjà des catégories
        const existing = await ctx.db
            .query("categories")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        if (existing) return; // L'utilisateur a déjà des catégories

        // Créer les catégories par défaut selon la locale
        const defaults = defaultCategoriesForLocale(args.locale ?? "fr");
        for (const category of defaults) {
            await ctx.db.insert("categories", {
                userId: identity.subject,
                ...category,
            });
        }
    },
});

// Mutation: Réinitialiser les catégories par défaut (supprime les catégories existantes puis recrée selon la locale)
export const resetDefaultCategories = mutation({
    args: {
        locale: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        // Supprimer les catégories existantes de l'utilisateur
        const existing = await ctx.db
            .query("categories")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();

        for (const cat of existing) {
            await ctx.db.delete(cat._id);
        }

        // Recréer selon la locale demandée
        const defaults = defaultCategoriesForLocale(args.locale);
        for (const category of defaults) {
            await ctx.db.insert("categories", {
                userId: identity.subject,
                ...category,
            });
        }
    },
});

function defaultCategoriesForLocale(locale: string) {
    if (locale === "ar") {
        return [
            { name: "طعام", icon: "utensils", color: "#ef4444" },
            { name: "نقل", icon: "car", color: "#f59e0b" },
            { name: "سكن", icon: "home", color: "#10b981" },
            { name: "ترفيه", icon: "gamepad-2", color: "#3b82f6" },
            { name: "صحة", icon: "heart-pulse", color: "#ec4899" },
            { name: "ملابس", icon: "shirt", color: "#8b5cf6" },
            { name: "تقنية", icon: "smartphone", color: "#06b6d4" },
            { name: "أخرى", icon: "more-horizontal", color: "#6b7280" },
        ];
    }
    // Par défaut FR
    return [
        { name: "Alimentation", icon: "utensils", color: "#ef4444" },
        { name: "Transport", icon: "car", color: "#f59e0b" },
        { name: "Logement", icon: "home", color: "#10b981" },
        { name: "Loisirs", icon: "gamepad-2", color: "#3b82f6" },
        { name: "Santé", icon: "heart-pulse", color: "#ec4899" },
        { name: "Vêtements", icon: "shirt", color: "#8b5cf6" },
        { name: "Technologie", icon: "smartphone", color: "#06b6d4" },
        { name: "Autres", icon: "more-horizontal", color: "#6b7280" },
    ];
}
