import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query: Obtenir les budgets du mois en cours
export const getBudgets = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const budgets = await ctx.db
            .query("budgets")
            .withIndex("by_user_and_month", (q) =>
                q.eq("userId", identity.subject).eq("month", currentMonth)
            )
            .collect();

        // Enrichir avec les informations de catégorie et les dépenses
        return await Promise.all(
            budgets.map(async (budget) => {
                const category = await ctx.db.get(budget.categoryId);

                // Calculer les dépenses du mois pour cette catégorie
                const startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

                const transactions = await ctx.db
                    .query("transactions")
                    .withIndex("by_user_and_date", (q) =>
                        q.eq("userId", identity.subject)
                            .gte("date", startDate)
                            .lte("date", endDate)
                    )
                    .filter((q) => q.eq(q.field("categoryId"), budget.categoryId))
                    .collect();

                const spent = transactions.reduce((sum, t) => sum + t.amount, 0);

                return {
                    ...budget,
                    category,
                    spent,
                    remaining: budget.monthlyLimit - spent,
                    percentage: (spent / budget.monthlyLimit) * 100,
                };
            })
        );
    },
});

// Mutation: Définir ou mettre à jour un budget
export const setBudget = mutation({
    args: {
        categoryId: v.id("categories"),
        monthlyLimit: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        // Vérifier que la catégorie appartient à l'utilisateur
        const category = await ctx.db.get(args.categoryId);
        if (!category || category.userId !== identity.subject) {
            throw new Error("Catégorie invalide");
        }

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Vérifier si un budget existe déjà pour cette catégorie ce mois-ci
        const existing = await ctx.db
            .query("budgets")
            .withIndex("by_user_and_month", (q) =>
                q.eq("userId", identity.subject).eq("month", currentMonth)
            )
            .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
            .first();

        if (existing) {
            // Mettre à jour le budget existant
            await ctx.db.patch(existing._id, {
                monthlyLimit: args.monthlyLimit,
            });
            return existing._id;
        } else {
            // Créer un nouveau budget
            return await ctx.db.insert("budgets", {
                userId: identity.subject,
                categoryId: args.categoryId,
                monthlyLimit: args.monthlyLimit,
                month: currentMonth,
            });
        }
    },
});

// Mutation: Supprimer un budget
export const deleteBudget = mutation({
    args: {
        id: v.id("budgets"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Non authentifié");

        const budget = await ctx.db.get(args.id);
        if (!budget || budget.userId !== identity.subject) {
            throw new Error("Budget non trouvé");
        }

        await ctx.db.delete(args.id);
    },
});
