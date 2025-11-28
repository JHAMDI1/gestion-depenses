"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatter, useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";

export function TopExpensesList() {
    const t = useTranslations("stats");
    const format = useFormatter();
    const topExpenses = useQuery(api.analytics.getTopExpenses, { limit: 5 });

    if (!topExpenses) {
        return <Skeleton className="h-[350px] w-full rounded-xl" />;
    }

    const maxAmount = topExpenses[0]?.amount || 1;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("topExpenses")}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {topExpenses.map((expense: { _id: string; name: string; amount: number; categoryColor: string; categoryName: string }) => (
                        <div key={expense._id} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: expense.categoryColor }}
                                    />
                                    <span className="font-medium">{expense.name}</span>
                                    <span className="text-muted-foreground text-xs">({expense.categoryName})</span>
                                </div>
                                <span className="font-bold">
                                    {format.number(expense.amount, { style: "currency", currency: "TND" })}
                                </span>
                            </div>
                            <Progress
                                value={(expense.amount / maxAmount) * 100}
                                className="h-2"
                                indicatorClassName="bg-destructive"
                            />
                        </div>
                    ))}
                    {topExpenses.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">{t("noExpenses")}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
