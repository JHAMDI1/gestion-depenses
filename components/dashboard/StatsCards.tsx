"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, AlertCircle } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";

interface StatsCardsProps {
    monthlyTotal: { total: number; count: number } | undefined;
    budgets: any[] | undefined;
}

export function StatsCards({ monthlyTotal, budgets }: StatsCardsProps) {
    const t = useTranslations("dashboard");
    const format = useFormatter();

    const totalBudgetLimit = budgets?.reduce((sum, b) => sum + b.monthlyLimit, 0) || 0;
    const totalRemaining = budgets?.reduce((sum, b) => sum + b.remaining, 0) || 0;
    const budgetsExceeded = budgets?.filter(b => b.percentage > 100).length || 0;


    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="group relative overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(60%_60%_at_20%_0%,rgba(99,102,241,0.10),transparent)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t("totalSpent")}
                    </CardTitle>
                    <div
                        className="h-9 w-9 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-primary to-violet-500"
                    >
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-[32px] leading-tight font-bold">
                        {monthlyTotal ? format.number(monthlyTotal.total, { style: 'currency', currency: 'TND' }) : format.number(0, { style: 'currency', currency: 'TND' })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {monthlyTotal?.count || 0} transaction(s)
                    </p>
                </CardContent>
            </Card>

            <Card className="group relative overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(60%_60%_at_20%_0%,rgba(6,182,212,0.10),transparent)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t("remainingBudget")}
                    </CardTitle>
                    <div
                        className="h-9 w-9 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-cyan-500 to-blue-500"
                    >
                        <Wallet className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-[32px] leading-tight font-bold">
                        {totalBudgetLimit > 0
                            ? format.number(totalRemaining, { style: 'currency', currency: 'TND' })
                            : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {totalBudgetLimit > 0
                            ? `sur ${format.number(totalBudgetLimit, { style: 'currency', currency: 'TND' })}`
                            : t("remainingBudget")}
                    </p>
                </CardContent>
            </Card>

            <Card className="group relative overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(60%_60%_at_20%_0%,rgba(245,158,11,0.12),transparent)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("alerts")}</CardTitle>
                    <div
                        className="h-9 w-9 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-amber-500 to-orange-500"
                    >
                        <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-[32px] leading-tight font-bold">{budgetsExceeded}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {budgetsExceeded === 0 ? t("noBudgetExceeded") : `${budgetsExceeded} budget(s) dépassé(s)`}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
