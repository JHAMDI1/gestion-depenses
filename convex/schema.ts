import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Catégories de dépenses
    categories: defineTable({
        userId: v.string(),
        name: v.string(),
        icon: v.string(),      // Nom de l'icône (ex: "utensils", "car")
        color: v.string(),     // Code couleur hex (ex: "#7c3aed")
    }).index("by_user", ["userId"]),

    // Transactions (dépenses individuelles)
    transactions: defineTable({
        userId: v.string(),
        categoryId: v.id("categories"),
        name: v.string(),
        amount: v.number(),    // Montant en TND
        date: v.number(),      // Timestamp
        createdAt: v.number(), // Timestamp de création
    })
        .index("by_user", ["userId"])
        .index("by_user_and_date", ["userId", "date"])
        .index("by_category", ["categoryId"]),

    // Budgets mensuels par catégorie
    budgets: defineTable({
        userId: v.string(),
        categoryId: v.id("categories"),
        monthlyLimit: v.number(), // Limite mensuelle en TND
        month: v.string(),        // Format: "2024-11" (année-mois)
    })
        .index("by_user", ["userId"])
        .index("by_user_and_month", ["userId", "month"])
        .index("by_category", ["categoryId"]),

    // Objectifs d'épargne
    goals: defineTable({
        userId: v.string(),
        name: v.string(),
        targetAmount: v.number(),  // Montant cible en TND
        savedAmount: v.number(),   // Montant épargné en TND
        deadline: v.optional(v.number()), // Timestamp optionnel
        createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Dépenses récurrentes
    recurrings: defineTable({
        userId: v.string(),
        categoryId: v.id("categories"),
        name: v.string(),
        amount: v.number(),       // Montant en TND
        dayOfMonth: v.number(),   // Jour du mois (1-31)
        isActive: v.boolean(),    // Actif ou non
    })
        .index("by_user", ["userId"])
        .index("by_category", ["categoryId"]),
});
