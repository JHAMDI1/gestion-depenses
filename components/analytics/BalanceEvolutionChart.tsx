"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatter, useTranslations } from "next-intl";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";

export function BalanceEvolutionChart() {
    const t = useTranslations("stats");
    const format = useFormatter();
    const history = useQuery(api.analytics.getBalanceHistory, { days: 30 });

    if (!history) {
        return <Skeleton className="h-[350px] w-full rounded-xl" />;
    }

    // Handle empty data
    if (history.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t("balanceEvolution")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <p>Aucune donnée disponible</p>
                            <p className="text-sm mt-2">Ajoutez des transactions pour voir l'évolution de votre solde</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate linear regression for prediction
    // y = mx + b
    const n = history.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    history.forEach((point: { date: number; balance: number }, i: number) => {
        sumX += i;
        sumY += point.balance;
        sumXY += i * point.balance;
        sumXX += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate prediction for next 15 days
    const lastDate = new Date(history[history.length - 1].date);
    const predictions = [];
    for (let i = 1; i <= 15; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + i);
        const predictedBalance = slope * (n - 1 + i) + intercept;
        predictions.push({
            date: nextDate.getTime(),
            balance: null, // No actual balance
            predicted: predictedBalance,
        });
    }

    // Merge data: history has 'balance', predictions has 'predicted'
    // We need to connect the last history point to the first prediction point
    const lastHistoryPoint = history[history.length - 1];
    const chartData = [
        ...history.map((h: { date: number; balance: number }) => ({ ...h, predicted: null })),
        { ...lastHistoryPoint, balance: null, predicted: lastHistoryPoint.balance }, // Bridge point
        ...predictions
    ];

    const isPositiveTrend = slope > 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{t("balanceEvolution")}</CardTitle>
                    {Math.abs(slope) > 0.1 && (
                        <div className={`flex items-center gap-1 text-sm ${isPositiveTrend ? "text-green-500" : "text-red-500"}`}>
                            <TrendingUp className={`h-4 w-4 ${!isPositiveTrend && "rotate-180"}`} />
                            {isPositiveTrend ? t("trendUp") : t("trendDown")}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => format.dateTime(date, { day: "numeric", month: "short" })}
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value} TND`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--popover)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                }}
                                labelFormatter={(date) => format.dateTime(date, { day: "numeric", month: "long" })}
                                formatter={(value: number, name: string) => [
                                    format.number(value, { style: "currency", currency: "TND" }),
                                    name === "predicted" ? t("prediction") : t("balance")
                                ]}
                            />
                            <Line
                                type="monotone"
                                dataKey="balance"
                                stroke="hsl(262.1 83.3% 57.8%)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="predicted"
                                stroke="hsl(215.4 16.3% 46.9%)"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
