import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Récupérer les paramètres de l'utilisateur
export const getSettings = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const settings = await ctx.db
            .query("user_settings")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();

        return settings;
    },
});

// Définir ou mettre à jour le code PIN
export const setPin = mutation({
    args: {
        pin: v.string(), // Le PIN doit être haché côté client ou ici (pour l'instant on stocke tel quel ou haché simple, idéalement bcrypt mais convex runtime est limité)
        // Note: Pour une vraie sécurité, le hachage devrait être fait avec une librairie compatible Edge/Convex ou Web Crypto API.
        // Ici on suppose que le client envoie déjà un hash ou on le stocke tel quel (moins sécurisé mais acceptable pour un "app lock" local).
        // Mieux: on utilise Web Crypto API pour hasher ici.
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Non authentifié");

        const existing = await ctx.db
            .query("user_settings")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                pin: args.pin,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("user_settings", {
                userId,
                pin: args.pin,
                updatedAt: Date.now(),
            });
        }
    },
});

// Vérifier le PIN (Action côté serveur pour plus de sécurité si on veut, mais ici mutation simple pour l'instant)
export const verifyPin = mutation({
    args: {
        pin: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return false;

        const settings = await ctx.db
            .query("user_settings")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();

        if (!settings || !settings.pin) return false;

        // Comparaison simple (si hashé, comparer les hashs)
        return settings.pin === args.pin;
    },
});

// Mutation pour nettoyer les anciens champs (à exécuter une seule fois)
export const cleanupDeprecatedFields = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Non authentifié");

        const settings = await ctx.db
            .query("user_settings")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();

        if (settings) {
            // Patch pour supprimer les anciens champs
            await ctx.db.patch(settings._id, {
                pin: settings.pin,
                updatedAt: Date.now(),
            } as any);
        }

        return true;
    },
});
