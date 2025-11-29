"use client";

import { Doughnut, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { useFormatter } from "next-intl";

// Register Chart.js components
ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface CategoryDistributionChartProps {
    filter: "EXPENSE" | "INCOME" | "ALL";
    comparisonSeries: any[];
    displayData: any[];
}

export function CategoryDistributionChart({ filter, comparisonSeries, displayData }: CategoryDistributionChartProps) {
    const formatFormatter = useFormatter();

    if (filter === "ALL") {
        // Bar chart for income/expense comparison
        const barChartData = {
            labels: comparisonSeries.map((item) => item.month),
            datasets: [
                {
                    label: "Revenus",
                    data: comparisonSeries.map((item) => item.income),
                    backgroundColor: "#10b981",
                    borderColor: "#10b981",
                    borderWidth: 0,
                    borderRadius: 4,
                },
                {
                    label: "Dépenses",
                    data: comparisonSeries.map((item) => item.expense),
                    backgroundColor: "#ef4444",
                    borderColor: "#ef4444",
                    borderWidth: 0,
                    borderRadius: 4,
                },
            ],
        };

        const barOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top' as const,
                    labels: {
                        color: 'hsl(var(--foreground))',
                        padding: 12,
                        font: {
                            size: 12,
                        },
                    },
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
                            label += formatFormatter.number(context.parsed.y, { style: 'currency', currency: 'TND' });
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
            <div className="h-[300px]">
                <Bar data={barChartData} options={barOptions} />
            </div>
        );
    }

    // Doughnut chart for category distribution
    const doughnutData = {
        labels: displayData.map((item) => item.name),
        datasets: [
            {
                data: displayData.map((item) => item.value),
                backgroundColor: displayData.map((item) => item.color || 'hsl(262.1 83.3% 57.8%)'),
                borderColor: '#fff',
                borderWidth: 2,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right' as const,
                labels: {
                    color: 'hsl(var(--foreground))',
                    padding: 12,
                    font: {
                        size: 12,
                    },
                    boxWidth: 12,
                    boxHeight: 12,
                },
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
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += formatFormatter.number(context.parsed, { style: 'currency', currency: 'TND' });
                        return label;
                    }
                }
            },
        },
    };

    return (
        <div className="h-[300px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
    );
}
