import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getExpensesByCategoryRange = query({
  args: {
    start: v.number(),
    end: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", identity.subject).gte("date", args.start).lte("date", args.end)
      )
      .collect();

    // Filtrer uniquement les dépenses
    const expenses = txs.filter(t => !t.type || t.type === "EXPENSE");

    const totals = new Map<Id<"categories">, number>();
    for (const t of expenses) {
      const key = t.categoryId as Id<"categories">;
      totals.set(key, (totals.get(key) || 0) + t.amount);
    }

    const result = [] as Array<{ categoryId: Id<"categories">; name: string; color?: string; amount: number }>;
    for (const [catId, amount] of totals) {
      const catDoc = await ctx.db.get(catId);
      result.push({ categoryId: catId, name: (catDoc as any)?.name ?? "", color: (catDoc as any)?.color, amount });
    }

    result.sort((a, b) => b.amount - a.amount);
    return result;
  },
});

export const getMonthlySeries = query({
  args: {
    months: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (args.months - 1), 1).getTime();

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject).gte("date", start))
      .collect();

    // Filtrer uniquement les dépenses  
    const expenses = txs.filter(t => !t.type || t.type === "EXPENSE");

    const series = new Map<string, number>();
    for (let i = args.months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      series.set(key, 0);
    }

    for (const t of expenses) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (series.has(key)) series.set(key, (series.get(key) || 0) + t.amount);
    }

    return Array.from(series.entries()).map(([month, amount]) => ({ month, amount }));
  },
});

// ===== NOUVELLES QUERIES POUR LES REVENUS =====

export const getIncomesByCategoryRange = query({
  args: {
    start: v.number(),
    end: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", identity.subject).gte("date", args.start).lte("date", args.end)
      )
      .collect();

    // Filtrer uniquement les revenus
    const incomes = txs.filter(t => t.type === "INCOME");

    const totals = new Map<Id<"categories">, number>();
    for (const t of incomes) {
      const key = t.categoryId as Id<"categories">;
      totals.set(key, (totals.get(key) || 0) + t.amount);
    }

    const result = [] as Array<{ categoryId: Id<"categories">; name: string; color?: string; amount: number }>;
    for (const [catId, amount] of totals) {
      const catDoc = await ctx.db.get(catId);
      result.push({ categoryId: catId, name: (catDoc as any)?.name ?? "", color: (catDoc as any)?.color, amount });
    }

    result.sort((a, b) => b.amount - a.amount);
    return result;
  },
});

export const getIncomesMonthlySeries = query({
  args: {
    months: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (args.months - 1), 1).getTime();

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject).gte("date", start))
      .collect();

    // Filtrer uniquement les revenus
    const incomes = txs.filter(t => t.type === "INCOME");

    const series = new Map<string, number>();
    for (let i = args.months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      series.set(key, 0);
    }

    for (const t of incomes) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (series.has(key)) series.set(key, (series.get(key) || 0) + t.amount);
    }

    return Array.from(series.entries()).map(([month, amount]) => ({ month, amount }));
  },
});

export const getComparisonMonthlySeries = query({
  args: {
    months: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (args.months - 1), 1).getTime();

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject).gte("date", start))
      .collect();

    const incomeSeries = new Map<string, number>();
    const expenseSeries = new Map<string, number>();

    for (let i = args.months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      incomeSeries.set(key, 0);
      expenseSeries.set(key, 0);
    }

    for (const t of txs) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      if (t.type === "INCOME" && incomeSeries.has(key)) {
        incomeSeries.set(key, (incomeSeries.get(key) || 0) + t.amount);
      } else if ((!t.type || t.type === "EXPENSE") && expenseSeries.has(key)) {
        expenseSeries.set(key, (expenseSeries.get(key) || 0) + t.amount);
      }
    }

    return Array.from(incomeSeries.entries()).map(([month], index) => ({
      month,
      income: incomeSeries.get(month) || 0,
      expense: expenseSeries.get(month) || 0,
    }));
  },
});
