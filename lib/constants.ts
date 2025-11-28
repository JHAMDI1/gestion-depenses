/**
 * Constantes globales de l'application Masrouf
 */

// ===== INTERVALLES DE TEMPS =====
export const TIME_INTERVALS = {
    /** 12 heures en millisecondes (récurrentes quotidiennes) */
    DAILY_MIN: 12 * 60 * 60 * 1000,
    /** 24 heures en millisecondes (récurrentes hebdomadaires/mensuelles) */
    WEEKLY_MIN: 24 * 60 * 60 * 1000,
    /** 1 jour en millisecondes */
    ONE_DAY: 24 * 60 * 60 * 1000,
    /** 1 semaine en millisecondes */
    ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
    /** 1 mois (30 jours) en millisecondes */
    ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

// ===== DEVISE =====
export const CURRENCY = {
    /** Code devise par défaut */
    CODE: "TND",
    /** Symbole devise */
    SYMBOL: "د.ت",
    /** Nom complet */
    NAME: "Dinar Tunisien",
    /** Position symbole (avant ou après) */
    SYMBOL_POSITION: "after" as const,
} as const;

// ===== CONFIGURATION PAGINATION =====
export const PAGINATION = {
    /** Nombre de transactions par page */
    TRANSACTIONS_PER_PAGE: 20,
    /** Nombre de dettes par page */
    DEBTS_PER_PAGE: 10,
    /** Limite par défaut pour queries */
    DEFAULT_LIMIT: 100,
    /** Limite maximale */
    MAX_LIMIT: 1000,
} as const;

// ===== FRÉQUENCES RÉCURRENTES =====
export const RECURRING_FREQUENCIES = {
    DAILY: "DAILY",
    WEEKLY: "WEEKLY",
    MONTHLY: "MONTHLY",
    YEARLY: "YEARLY",
} as const;

export type RecurringFrequency = keyof typeof RECURRING_FREQUENCIES;

// ===== TYPES DE TRANSACTIONS =====
export const TRANSACTION_TYPES = {
    EXPENSE: "EXPENSE",
    INCOME: "INCOME",
} as const;

export type TransactionType = keyof typeof TRANSACTION_TYPES;

// ===== TYPES DE DETTES =====
export const DEBT_TYPES = {
    BORROWED: "BORROWED", // J'ai emprunté
    LENT: "LENT",         // J'ai prêté
} as const;

export type DebtType = keyof typeof DEBT_TYPES;

// ===== PÉRIODES STATISTIQUES =====
export const STATS_PERIODS = {
    /** 3 derniers mois */
    THREE_MONTHS: 3,
    /** 6 derniers mois */
    SIX_MONTHS: 6,
    /** 12 derniers mois */
    TWELVE_MONTHS: 12,
} as const;

// ===== COULEURS PAR DÉFAUT =====
export const DEFAULT_COLORS = {
    PRIMARY: "#7c3aed",
    EXPENSE: "#ef4444",
    INCOME: "#10b981",
    CATEGORY_FALLBACK: "#6b7280",
} as const;

// ===== LIMITES VALIDATION =====
export const VALIDATION_LIMITS = {
    /** Montant minimum (0.01) */
    MIN_AMOUNT: 0.01,
    /** Montant maximum */
    MAX_AMOUNT: 999999999,
    /** Longueur minimale nom */
    MIN_NAME_LENGTH: 1,
    /** Longueur maximale nom */
    MAX_NAME_LENGTH: 100,
    /** Longueur maximale description */
    MAX_DESCRIPTION_LENGTH: 500,
} as const;

// ===== ROUTES =====
export const ROUTES = {
    HOME: "/",
    DASHBOARD: "/dashboard",
    TRANSACTIONS: "/transactions",
    STATS: "/stats",
    BUDGETS: "/budgets",
    GOALS: "/goals",
    DEBTS: "/debts",
    RECURRINGS: "/recurrings",
    SETTINGS: "/settings",
    SIGN_IN: "/sign-in",
    SIGN_UP: "/sign-up",
} as const;

// ===== LOCALES =====
export const LOCALES = {
    FR: "fr",
    AR: "ar",
} as const;

export type Locale = typeof LOCALES[keyof typeof LOCALES];

// ===== EXPORT TYPES =====
export type Currency = typeof CURRENCY;
export type Routes = typeof ROUTES;
