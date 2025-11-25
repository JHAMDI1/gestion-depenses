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
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";
import { Loader2, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { ExportCSV } from "@/components/stats/ExportCSV";
import { TopCategoriesTable } from "@/components/stats/TopCategoriesTable";
import { useTranslations, useFormatter, useLocale } from "next-intl";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

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
    const months = parseInt(timeRange);
    const now = new Date();
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1).getTime();
    const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

    // Server-side aggregations via Convex
    const monthlySeries = useQuery(api.stats.getMonthlySeries, { months });
    const expensesAgg = useQuery(api.stats.getExpensesByCategoryRange, { start: rangeStart, end: rangeEnd });

    // Keep raw transactions only for CSV export convenience
    const transactions = useQuery(api.transactions.getTransactions, { limit: 1000 });

    if (!monthlySeries || !expensesAgg) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const expensesByCategory = expensesAgg
        .map((row: ExpenseAggRow) => ({ name: row.name, value: row.amount, color: row.color ?? 'var(--color-primary)' }))
        .filter((item: { value: number }) => item.value > 0);

    const monthLocale = locale === 'ar' ? ar : fr;
    const lastXMonths = monthlySeries
        .map((m: MonthlyPoint) => {
            const [y, mm] = m.month.split('-');
            const d = new Date(Number(y), Number(mm) - 1, 1);
            return { name: format(d, 'MMM', { locale: monthLocale }), amount: m.amount, date: d };
        });

    const totalExpenses = expensesByCategory.reduce((sum: number, r: { value: number }) => sum + r.value, 0);
    const averageMonthly = monthlySeries.reduce((sum: number, m: MonthlyPoint) => sum + m.amount, 0) / (months || 1);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold">{t("title")}</h1>
                    <p className="text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {transactions && (
                        <ExportCSV data={transactions} filename={`masrouf_export_${new Date().toISOString().split('T')[0]}.csv`} />
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

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{t("monthlyTrend")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={lastXMonths}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--color-muted-foreground)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--color-muted-foreground)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value} TND`}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => formatFormatter.number(value, { style: 'currency', currency: 'TND' })}
                                        contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        fill="var(--color-primary)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{t("categoryDistribution")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expensesByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expensesByCategory.map((entry: { color?: string }, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || 'var(--color-primary)'} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => formatFormatter.number(value, { style: 'currency', currency: 'TND' })}
                                        contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <TopCategoriesTable data={expensesByCategory} totalExpenses={totalExpenses} />
        </div>
    );
}
