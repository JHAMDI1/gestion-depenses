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
        type: v.optional(v.string()),      // "EXPENSE" ou "INCOME" (optionnel pour compatibilité avec données existantes)
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

    // Dépenses/Revenus récurrents (abonnements, salaires, etc.)
    recurrings: defineTable({
        userId: v.string(),
        categoryId: v.id("categories"),
        name: v.string(),
        amount: v.number(),
        type: v.optional(v.string()),           // "EXPENSE" ou "INCOME" (optionnel pour compatibilité)
        frequency: v.optional(v.string()),      // "DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "BIMONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL", "BIANNUAL"
        dayOfWeek: v.optional(v.number()),      // 0-6 pour hebdomadaire/bi-hebdomadaire
        dayOfMonth: v.optional(v.number()),     // 1-31 pour mensuel et plus (devient optionnel)
        startDate: v.optional(v.number()),      // Date de début (timestamp)
        isActive: v.boolean(),
        createdAt: v.optional(v.number()),
        lastGenerated: v.optional(v.number()),  // Dernière génération automatique (timestamp)
    })
        .index("by_user", ["userId"])
        .index("by_user_active", ["userId", "isActive"])
        .index("by_category", ["categoryId"]),

    // Solde/Balance du compte
    balance: defineTable({
        userId: v.string(),
        initialAmount: v.number(),     // Montant initial du compte en TND
        currency: v.string(),          // "TND"
        createdAt: v.number(),         // Timestamp de création
        updatedAt: v.number(),         // Timestamp de dernière modification
    }).index("by_user", ["userId"]),

    // Dettes et créances
    debts: defineTable({
        userId: v.string(),
        personName: v.string(),    // Nom de la personne
        amount: v.number(),        // Montant total en TND
        type: v.string(),          // "LENT" (j'ai prêté) ou "BORROWED" (j'ai emprunté)
        dueDate: v.optional(v.number()), // Date d'échéance (timestamp optionnel)
        isPaid: v.boolean(),       // Statut de remboursement
        description: v.optional(v.string()), // Description optionnelle
        createdAt: v.number(),     // Timestamp de création
    }).index("by_user", ["userId"]),
});
