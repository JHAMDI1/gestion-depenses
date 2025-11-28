import { Id } from "@/convex/_generated/dataModel";

/**
 * Types globaux pour l'application Masrouf
 */

// ===== TYPES DE BASE =====

export type Locale = "fr" | "ar";

export type TransactionType = "EXPENSE" | "INCOME";

export type DebtType = "BORROWED" | "LENT";

export type RecurringFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

// ===== MODELS =====

export interface Transaction {
    _id: Id<"transactions">;
    _creationTime: number;
    userId: string;
    categoryId: Id<"categories">;
    name: string;
    amount: number;
    type: TransactionType;
    date: number;
    createdAt: number;
}

export interface Category {
    _id: Id<"categories">;
    _creationTime: number;
    userId: string;
    name: string;
    icon: string;
    color: string;
}

export interface Debt {
    _id: Id<"debts">;
    _creationTime: number;
    userId: string;
    person: string;
    amount: number;
    type: DebtType;
    description?: string;
    dueDate?: number;
    isPaid: boolean;
    createdAt: number;
}

export interface Budget {
    _id: Id<"budgets">;
    _creationTime: number;
    userId: string;
    categoryId: Id<"categories">;
    monthlyLimit: number;
    isActive: boolean;
}

export interface Goal {
    _id: Id<"goals">;
    _creationTime: number;
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: number;
    createdAt: number;
}

export interface Recurring {
    _id: Id<"recurrings">;
    _creationTime: number;
    userId: string;
    categoryId: Id<"categories">;
    name: string;
    amount: number;
    type: TransactionType;
    frequency: RecurringFrequency;
    dayOfMonth?: number;
    dayOfWeek?: number;
    isActive: boolean;
    lastGenerated?: number;
    createdAt: number;
}

export interface Balance {
    _id: Id<"balance">;
    _creationTime: number;
    userId: string;
    initialBalance: number;
}

// ===== TYPES DÉRIVÉS =====

/** Transaction avec catégorie populée */
export interface TransactionWithCategory extends Transaction {
    category?: Category;
}

/** Budget avec catégorie populée */
export interface BudgetWithCategory extends Budget {
    category?: Category;
}

/** Recurring avec catégorie populée */
export interface RecurringWithCategory extends Recurring {
    category?: Category;
}

// ===== TYPES STATS =====

export interface CategoryAggregate {
    name: string;
    amount: number;
    color?: string;
}

export interface MonthlyDataPoint {
    month: string;  // Format: "YYYY-MM"
    amount: number;
}

export interface ComparisonDataPoint {
    month: string;  // Format: "YYYY-MM"
    income: number;
    expense: number;
}

// ===== TYPES UI =====

export interface SelectOption<T = string> {
    label: string;
    value: T;
}

export interface FilterState {
    search?: string;
    categoryId?: Id<"categories">;
    type?: TransactionType;
    startDate?: number;
    endDate?: number;
    minAmount?: number;
    maxAmount?: number;
}

export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
}

// ===== TYPES FORM =====

export interface FormError {
    field: string;
    message: string;
}

export interface FormState<T> {
    data: T;
    errors: FormError[];
    isSubmitting: boolean;
    isValid: boolean;
}

// ===== TYPES API RESPONSE =====

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ValidationResult {
    success: boolean;
    error?: string;
}

// ===== TYPES UTILITY =====

/** Rend tous les champs optionnels */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Rend tous les champs requis */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Extrait les valeurs d'un objet const */
export type ValueOf<T> = T[keyof T];
