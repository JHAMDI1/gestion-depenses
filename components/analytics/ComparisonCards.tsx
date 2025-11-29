"use client";

// Force rebuild

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export function ComparisonCards() {
    const t = useTranslations("stats");
    const format = useFormatter();
    const stats = useQuery(api.analytics.getMonthlyStats);

    if (!stats) {
        return <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
    }

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const monthExpenseChange = calculateChange(stats.thisMonth.expense, stats.lastMonth.expense);
    const yearExpenseChange = calculateChange(stats.thisYear.expense, stats.lastYear.expense);

    const ComparisonCard = ({ title, current, previous, change, period }: any) => {
        const isIncrease = change > 0;
        const isNeutral = change === 0;

        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {format.number(current, { style: "currency", currency: "TND" })}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className={`flex items-center ${isNeutral ? "text-muted-foreground" : isIncrease ? "text-red-500" : "text-green-500"}`}>
                            {isNeutral ? <Minus className="h-3 w-3 mr-1" /> : isIncrease ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                            {Math.abs(change).toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground">vs {period}</span>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <ComparisonCard
                title={t("monthlyExpenses")}
                current={stats.thisMonth.expense}
                previous={stats.lastMonth.expense}
                change={monthExpenseChange}
                period={t("lastMonth")}
            />
            <ComparisonCard
                title={t("yearlyExpenses")}
                current={stats.thisYear.expense}
                previous={stats.lastYear.expense}
                change={yearExpenseChange}
                period={t("lastYear")}
            />
        </div>
    );
}
