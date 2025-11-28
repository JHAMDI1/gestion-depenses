import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";

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

// Internal Mutation: Traiter toutes les récurrentes éligibles (pour cron)
export const processAllRecurrings = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;

        // Récupérer toutes les récurrentes actives
        const allRecurrings = await ctx.db
            .query("recurrings")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        let generated = 0;
        let skipped = 0;

        for (const recurring of allRecurrings) {
            // Vérifier si déjà généré dans les dernières 24h
            if (recurring.lastGenerated && recurring.lastGenerated > oneDayAgo) {
                skipped++;
                continue;
            }

            // Créer la transaction
            try {
                await ctx.db.insert("transactions", {
                    userId: recurring.userId,
                    categoryId: recurring.categoryId,
                    name: `${recurring.name} (Auto)`,
                    amount: recurring.amount,
                    type: recurring.type || "EXPENSE",
                    date: now,
                    createdAt: now,
                });

                // Mettre à jour lastGenerated
                await ctx.db.patch(recurring._id, {
                    lastGenerated: now,
                });

                generated++;
            } catch (error) {
                console.error(`Erreur génération récurrente ${recurring._id}:`, error);
            }
        }

        return { generated, skipped, total: allRecurrings.length };
    },
});
