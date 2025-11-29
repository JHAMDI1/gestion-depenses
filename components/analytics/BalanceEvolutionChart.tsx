"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatter, useTranslations } from "next-intl";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { TrendingUp } from "lucide-react";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

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
            balance: predictedBalance,
        });
    }

    const isPositiveTrend = slope > 0;

    // Prepare data for Chart.js
    const labels = [
        ...history.map((h: { date: number }) => format.dateTime(h.date, { day: "numeric", month: "short" })),
        ...predictions.map((p) => format.dateTime(p.date, { day: "numeric", month: "short" }))
    ];

    const balanceData = [
        ...history.map((h: { balance: number }) => h.balance),
        ...Array(predictions.length).fill(null) // No actual balance for predictions
    ];

    const predictionData = [
        ...Array(history.length - 1).fill(null), // No predictions for history
        history[history.length - 1].balance, // Bridge point
        ...predictions.map((p) => p.balance)
    ];

    const data = {
        labels,
        datasets: [
            {
                label: t("balance"),
                data: balanceData,
                borderColor: "hsl(262.1 83.3% 57.8%)",
                backgroundColor: "hsla(262.1, 83.3%, 57.8%, 0.1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
            {
                label: t("prediction"),
                data: predictionData,
                borderColor: "hsl(215.4 16.3% 46.9%)",
                backgroundColor: "transparent",
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0.4,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'hsl(var(--border))',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += format.number(context.parsed.y, { style: "currency", currency: "TND" });
                        }
                        return label;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    maxRotation: 0,
                    autoSkipPadding: 20,
                    color: 'hsl(var(--muted-foreground))',
                    font: {
                        size: 11,
                    },
                },
            },
            y: {
                grid: {
                    color: 'hsl(var(--border))',
                    drawBorder: false,
                },
                ticks: {
                    callback: function (value: any) {
                        return value + ' TND';
                    },
                    color: 'hsl(var(--muted-foreground))',
                    font: {
                        size: 11,
                    },
                },
            },
        },
    };

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
                    <Line data={data} options={options} />
                </div>
            </CardContent>
        </Card>
    );
}
