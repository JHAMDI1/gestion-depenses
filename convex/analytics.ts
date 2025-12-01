import { v } from "convex/values";
import { query } from "./_generated/server";

// Helper to get start/end of month
const getMonthRange = (year: number, month: number) => {
    const start = new Date(year, month, 1).getTime();
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
    return { start, end };
};

// 1. Historique du solde (Balance Evolution)
export const getBalanceHistory = query({
    args: {
        days: v.optional(v.number()), // Default 30 days
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const days = args.days || 30;
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days).getTime();

        // Get initial balance
        const balanceRecord = await ctx.db
            .query("balance")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        const initialBalance = balanceRecord?.initialAmount || 0;

        // Get all transactions sorted by date
        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
            .collect();

        // Calculate cumulative balance day by day
        // This is a simplified approach. Ideally, we should aggregate by day.

        // Sort transactions by date ascending
        transactions.sort((a, b) => a.date - b.date);

        // Calculate balance up to startDate
        let currentBalance = initialBalance;
        const history: { date: number; balance: number }[] = [];

        // Map transactions to daily changes
        const dailyChanges = new Map<string, number>();

        for (const t of transactions) {
            const dateStr = new Date(t.date).toISOString().split('T')[0];
            const amount = t.type === "INCOME" ? t.amount : -t.amount;

            if (t.date < startDate) {
                currentBalance += amount;
            } else {
                const existing = dailyChanges.get(dateStr) || 0;
                dailyChanges.set(dateStr, existing + amount);
            }
        }

        // Generate daily points from startDate to now
        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];

            const change = dailyChanges.get(dateStr) || 0;
            currentBalance += change;

            history.push({
                date: date.getTime(),
                balance: currentBalance,
            });
        }

        return history;
    },
});

// 2. Top Dépenses du mois
export const getTopExpenses = query({
    args: {
        month: v.optional(v.string()), // Format "YYYY-MM" (deprecated, use start/end instead)
        limit: v.optional(v.number()),
        start: v.optional(v.number()), // Start timestamp
        end: v.optional(v.number()),   // End timestamp
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const limit = args.limit || 5;

        let start: number, end: number;

        // Use start/end if provided, otherwise use month parameter or current month
        if (args.start !== undefined && args.end !== undefined) {
            start = args.start;
            end = args.end;
        } else {
            const now = new Date();
            const monthStr = args.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const [year, month] = monthStr.split('-').map(Number);
            const range = getMonthRange(year, month - 1);
            start = range.start;
            end = range.end;
        }

        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", identity.subject).gte("date", start).lte("date", end)
            )
            .collect();

        // Filter expenses and sort by amount desc
        const expenses = transactions
            .filter(t => (t.type || "EXPENSE") === "EXPENSE")
            .sort((a, b) => b.amount - a.amount)
            .slice(0, limit);

        // Enrich with category info
        const expensesWithCategory = await Promise.all(expenses.map(async (t) => {
            const category = await ctx.db.get(t.categoryId);
            return {
                ...t,
                categoryName: category?.name || "Inconnu",
                categoryColor: category?.color || "#888",
                categoryIcon: category?.icon || "circle",
            };
        }));

        return expensesWithCategory;
    },
});

// 3. Comparaisons Mensuelles (Stats)
export const getMonthlyStats = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Helper to get stats for a specific month
        const getStatsForMonth = async (year: number, month: number) => {
            const { start, end } = getMonthRange(year, month);
            const transactions = await ctx.db
                .query("transactions")
                .withIndex("by_user_and_date", (q) =>
                    q.eq("userId", identity.subject).gte("date", start).lte("date", end)
                )
                .collect();

            let income = 0;
            let expense = 0;

            for (const t of transactions) {
                if (t.type === "INCOME") income += t.amount;
                else expense += t.amount;
            }

            return { income, expense };
        };

        const thisMonth = await getStatsForMonth(currentYear, currentMonth);

        // Last Month
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const lastMonth = await getStatsForMonth(lastMonthDate.getFullYear(), lastMonthDate.getMonth());

        // This Year Total (so far)
        const startOfYear = new Date(currentYear, 0, 1).getTime();
        const transactionsThisYear = await ctx.db
            .query("transactions")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", identity.subject).gte("date", startOfYear)
            )
            .collect();

        let thisYearIncome = 0;
        let thisYearExpense = 0;
        transactionsThisYear.forEach(t => {
            if (t.type === "INCOME") thisYearIncome += t.amount;
            else thisYearExpense += t.amount;
        });

        // Last Year Total
        const startOfLastYear = new Date(currentYear - 1, 0, 1).getTime();
        const endOfLastYear = new Date(currentYear - 1, 11, 31, 23, 59, 59).getTime();
        const transactionsLastYear = await ctx.db
            .query("transactions")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", identity.subject).gte("date", startOfLastYear).lte("date", endOfLastYear)
            )
            .collect();

        let lastYearIncome = 0;
        let lastYearExpense = 0;
        transactionsLastYear.forEach(t => {
            if (t.type === "INCOME") lastYearIncome += t.amount;
            else lastYearExpense += t.amount;
        });

        return {
            thisMonth,
            lastMonth,
            thisYear: { income: thisYearIncome, expense: thisYearExpense },
            lastYear: { income: lastYearIncome, expense: lastYearExpense },
        };
    },
});
