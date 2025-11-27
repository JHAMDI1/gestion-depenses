import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Mutation: Générer une transaction depuis une récurrente
export const generateTransactionFromRecurring = mutation({
    args: {
        recurringId: v.id("recurrings"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const recurring = await ctx.db.get(args.recurringId);
        if (!recurring || recurring.userId !== identity.subject) {
            throw new Error("Récurrente non trouvée");
        }

        if (!recurring.isActive) {
            throw new Error("Récurrente inactive");
        }

        const now = Date.now();
        const frequency = recurring.frequency || "MONTHLY";

        // Vérifier si on a déjà généré récemment (éviter doublons)
        if (recurring.lastGenerated) {
            const timeSinceLastGen = now - recurring.lastGenerated;
            const minInterval = frequency === "DAILY" ? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

            if (timeSinceLastGen < minInterval) {
                throw new Error("Transaction déjà générée récemment");
            }
        }

        // Créer la transaction
        const transactionId = await ctx.db.insert("transactions", {
            userId: identity.subject,
            categoryId: recurring.categoryId,
            name: `${recurring.name} (Auto)`,
            amount: recurring.amount,
            type: recurring.type || "EXPENSE",
            date: now,
            createdAt: now,
        });

        // Mettre à jour la récurrente
        await ctx.db.patch(args.recurringId, {
            lastGenerated: now,
        });

        return transactionId;
    },
});
