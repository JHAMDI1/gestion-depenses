import { z } from "zod";
import { VALIDATION_LIMITS, TRANSACTION_TYPES, DEBT_TYPES, RECURRING_FREQUENCIES } from "./constants";

/**
 * Schémas de validation Zod pour l'application Masrouf
 */

// ===== TRANSACTION =====
export const transactionSchema = z.object({
    categoryId: z.string().min(1, "Catégorie requise"),
    name: z
        .string()
        .min(VALIDATION_LIMITS.MIN_NAME_LENGTH, "Nom requis")
        .max(VALIDATION_LIMITS.MAX_NAME_LENGTH, "Nom trop long"),
    amount: z
        .number()
        .min(VALIDATION_LIMITS.MIN_AMOUNT, `Montant minimum: ${VALIDATION_LIMITS.MIN_AMOUNT}`)
        .max(VALIDATION_LIMITS.MAX_AMOUNT, "Montant trop élevé"),
    type: z.enum([TRANSACTION_TYPES.EXPENSE, TRANSACTION_TYPES.INCOME]).default(TRANSACTION_TYPES.EXPENSE),
    date: z.number().positive(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

// ===== CATÉGORIE =====
export const categorySchema = z.object({
    name: z
        .string()
        .min(VALIDATION_LIMITS.MIN_NAME_LENGTH, "Nom requis")
        .max(VALIDATION_LIMITS.MAX_NAME_LENGTH, "Nom trop long"),
    icon: z.string().min(1, "Icône requise").max(10, "Icône invalide"),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Couleur hexadécimale invalide"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// ===== DETTE =====
export const debtSchema = z.object({
    person: z
        .string()
        .min(VALIDATION_LIMITS.MIN_NAME_LENGTH, "Nom de la personne requis")
        .max(VALIDATION_LIMITS.MAX_NAME_LENGTH, "Nom trop long"),
    amount: z
        .number()
        .min(VALIDATION_LIMITS.MIN_AMOUNT, `Montant minimum: ${VALIDATION_LIMITS.MIN_AMOUNT}`)
        .max(VALIDATION_LIMITS.MAX_AMOUNT, "Montant trop élevé"),
    type: z.enum([DEBT_TYPES.BORROWED, DEBT_TYPES.LENT]),
    description: z
        .string()
        .max(VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH, "Description trop longue")
        .optional(),
    dueDate: z.number().optional(),
    isPaid: z.boolean().default(false),
});

export type DebtInput = z.infer<typeof debtSchema>;

// ===== BUDGET =====
export const budgetSchema = z.object({
    categoryId: z.string().min(1, "Catégorie requise"),
    monthlyLimit: z
        .number()
        .min(VALIDATION_LIMITS.MIN_AMOUNT, `Montant minimum: ${VALIDATION_LIMITS.MIN_AMOUNT}`)
        .max(VALIDATION_LIMITS.MAX_AMOUNT, "Montant trop élevé"),
    isActive: z.boolean().default(true),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

// ===== OBJECTIF D'ÉPARGNE =====
export const goalSchema = z.object({
    name: z
        .string()
        .min(VALIDATION_LIMITS.MIN_NAME_LENGTH, "Nom requis")
        .max(VALIDATION_LIMITS.MAX_NAME_LENGTH, "Nom trop long"),
    targetAmount: z
        .number()
        .min(VALIDATION_LIMITS.MIN_AMOUNT, `Montant minimum: ${VALIDATION_LIMITS.MIN_AMOUNT}`)
        .max(VALIDATION_LIMITS.MAX_AMOUNT, "Montant trop élevé"),
    currentAmount: z.number().min(0).default(0),
    deadline: z.number().optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;

// ===== TRANSACTION RÉCURRENTE =====
export const recurringSchema = z.object({
    categoryId: z.string().min(1, "Catégorie requise"),
    name: z
        .string()
        .min(VALIDATION_LIMITS.MIN_NAME_LENGTH, "Nom requis")
        .max(VALIDATION_LIMITS.MAX_NAME_LENGTH, "Nom trop long"),
    amount: z
        .number()
        .min(VALIDATION_LIMITS.MIN_AMOUNT, `Montant minimum: ${VALIDATION_LIMITS.MIN_AMOUNT}`)
        .max(VALIDATION_LIMITS.MAX_AMOUNT, "Montant trop élevé"),
    type: z.enum([TRANSACTION_TYPES.EXPENSE, TRANSACTION_TYPES.INCOME]).default(TRANSACTION_TYPES.EXPENSE),
    frequency: z.enum([
        RECURRING_FREQUENCIES.DAILY,
        RECURRING_FREQUENCIES.WEEKLY,
        RECURRING_FREQUENCIES.MONTHLY,
        RECURRING_FREQUENCIES.YEARLY,
    ]),
    dayOfMonth: z.number().min(1).max(31).optional(),
    dayOfWeek: z.number().min(0).max(6).optional(),
    isActive: z.boolean().default(true),
});

export type RecurringInput = z.infer<typeof recurringSchema>;

// ===== BALANCE INITIALE =====
export const initialBalanceSchema = z.object({
    amount: z.number(),  // Peut être négatif
});

export type InitialBalanceInput = z.infer<typeof initialBalanceSchema>;

// ===== HELPERS DE VALIDATION =====

/**
 * Valide un schéma et retourne le résultat avec gestion d'erreur
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: string;
} {
    try {
        const result = schema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data };
        }
        const firstError = result.error.issues[0];
        return {
            success: false,
            error: firstError.message,
        };
    } catch (error) {
        return {
            success: false,
            error: "Erreur de validation",
        };
    }
}

/**
 * Parse un schéma ou lance une erreur
 */
export function parseSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}
