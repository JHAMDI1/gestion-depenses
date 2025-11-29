"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { ExportCSV } from "@/components/stats/ExportCSV";
import { TopCategoriesTable } from "@/components/stats/TopCategoriesTable";
import { useTranslations, useFormatter, useLocale } from "next-intl";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ChartSkeleton, StatsCardSkeleton } from "@/components/shared/ChartSkeleton";
import PageTransition from "@/components/shared/PageTransition";

const BalanceEvolutionChart = dynamic(() => import("@/components/analytics/BalanceEvolutionChart").then(mod => mod.BalanceEvolutionChart), {
    loading: () => <ChartSkeleton />,
    ssr: false
});
const TopExpensesList = dynamic(() => import("@/components/analytics/TopExpensesList").then(mod => mod.TopExpensesList), {
    loading: () => <ChartSkeleton />,
    ssr: false
});
const ComparisonCards = dynamic(() => import("@/components/analytics/ComparisonCards").then(mod => mod.ComparisonCards), {
    loading: () => <div className="h-24 bg-muted animate-pulse rounded-lg" />,
    ssr: false
});
const MonthlyTrendChart = dynamic(() => import("@/components/analytics/MonthlyTrendChart").then(mod => mod.MonthlyTrendChart), {
    loading: () => <ChartSkeleton />,
    ssr: false
});
const CategoryDistributionChart = dynamic(() => import("@/components/analytics/CategoryDistributionChart").then(mod => mod.CategoryDistributionChart), {
    loading: () => <ChartSkeleton />,
    ssr: false
});

export default function StatsPage() {
    const tCommon = useTranslations("common");
    return (
        <AppLayout>
            <SignedIn>
                <StatsContent />
            </SignedIn>
            <SignedOut>
                <div className="flex min-h-[50vh] items-center justify-center">
                    <SignInButton mode="modal">
                        <Button size="lg">{tCommon("signIn")}</Button>
                    </SignInButton>
                </div>
            </SignedOut>
        </AppLayout>
    );
}

function StatsContent() {
    const t = useTranslations("stats");
    const formatFormatter = useFormatter();
    const locale = useLocale();
    type MonthlyPoint = { month: string; amount: number };
    type ExpenseAggRow = { name: string; amount: number; color?: string };

    const [timeRange, setTimeRange] = useState("6");
    const [filter, setFilter] = useState<"EXPENSE" | "INCOME" | "ALL">("EXPENSE");
    const months = parseInt(timeRange);
    const now = new Date();
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1).getTime();
    const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

    // Server-side aggregations via Convex
    const monthlySeries = useQuery(api.stats.getMonthlySeries, { months });
    const expensesAgg = useQuery(api.stats.getExpensesByCategoryRange, { start: rangeStart, end: rangeEnd });
    const incomeSeries = useQuery(api.stats.getIncomesMonthlySeries, { months });
    const incomesAgg = useQuery(api.stats.getIncomesByCategoryRange, { start: rangeStart, end: rangeEnd });
    const comparisonSeries = useQuery(api.stats.getComparisonMonthlySeries, { months });

    // Keep raw transactions only for CSV export convenience
    const transactions = useQuery(api.transactions.getTransactions, { limit: 100 });

    if (!monthlySeries || !expensesAgg || !incomeSeries || !incomesAgg || !comparisonSeries) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <ChartSkeleton />
                    <ChartSkeleton />
                </div>
            </div>
        );
    }

    const expensesByCategory = expensesAgg
        .map((row: ExpenseAggRow) => ({ name: row.name, value: row.amount, color: row.color ?? 'var(--color-primary)' }))
        .filter((item: { value: number }) => item.value > 0);

    const incomesByCategory = incomesAgg
        .map((row: ExpenseAggRow) => ({ name: row.name, value: row.amount, color: row.color ?? '#10b981' }))
        .filter((item: { value: number }) => item.value > 0);

    const monthLocale = locale === 'ar' ? ar : fr;
    const lastXMonths = monthlySeries
        .map((m: MonthlyPoint) => {
            const [y, mm] = m.month.split('-');
            const d = new Date(Number(y), Number(mm) - 1, 1);
            return { name: format(d, 'MMM', { locale: monthLocale }), amount: m.amount, date: d };
        });

    const totalExpenses = expensesByCategory.reduce((sum: number, r: { value: number }) => sum + r.value, 0);
    const totalIncomes = incomesByCategory.reduce((sum: number, r: { value: number }) => sum + r.value, 0);
    const averageMonthly = monthlySeries.reduce((sum: number, m: MonthlyPoint) => sum + m.amount, 0) / (months || 1);

    // Données à afficher selon le filtre
    const displayData = filter === "INCOME" ? incomesByCategory : expensesByCategory;
    const displayTotal = filter === "INCOME" ? totalIncomes : totalExpenses;

    return (
        <PageTransition className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold">{t("title")}</h1>
                    <p className="text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={filter === "EXPENSE" ? "default" : "outline"}
                            onClick={() => setFilter("EXPENSE")}
                            className={filter === "EXPENSE" ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                            Dépenses
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === "INCOME" ? "default" : "outline"}
                            onClick={() => setFilter("INCOME")}
                            className={filter === "INCOME" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                            Revenus
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === "ALL" ? "default" : "outline"}
                            onClick={() => setFilter("ALL")}
                        >
                            Comparaison
                        </Button>
                    </div>
                    {transactions && (
                        <ExportCSV data={transactions || []} filename={`masrouf_export_${new Date().toISOString().split('T')[0]}.csv`} />
                    )}
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder={t("period")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3">{t("last3Months")}</SelectItem>
                            <SelectItem value="6">{t("last6Months")}</SelectItem>
                            <SelectItem value="12">{t("last12Months")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("totalExpenses")}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatFormatter.number(totalExpenses, { style: 'currency', currency: 'TND' })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("monthlyAverage")}
                        </CardTitle>
                        <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatFormatter.number(averageMonthly, { style: 'currency', currency: 'TND' })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ComparisonCards />

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{t("monthlyTrend")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MonthlyTrendChart data={lastXMonths} />
                    </CardContent>
                </Card>

                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>
                            {filter === "INCOME" ? "Répartition des Revenus" : filter === "ALL" ? "Comparaison" : t("categoryDistribution")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CategoryDistributionChart filter={filter} comparisonSeries={comparisonSeries} displayData={displayData} />
                    </CardContent>
                </Card>
            </div>

            <BalanceEvolutionChart />

            <div className="grid gap-4 md:grid-cols-2">
                {filter !== "ALL" && <TopCategoriesTable data={displayData} totalExpenses={displayTotal} />}
                <TopExpensesList />
            </div>
        </PageTransition>
    );
}
