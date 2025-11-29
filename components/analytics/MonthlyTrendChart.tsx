"use client";

import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
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
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface MonthlyTrendChartProps {
    data: { name: string; amount: number; date: Date }[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
    const formatFormatter = useFormatter();

    const chartData = {
        labels: data.map((item) => item.name),
        datasets: [
            {
                label: "Montant",
                data: data.map((item) => item.amount),
                backgroundColor: "hsl(262.1 83.3% 57.8%)",
                borderColor: "hsl(262.1 83.3% 57.8%)",
                borderWidth: 0,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
                displayColors: false,
                callbacks: {
                    label: function (context: any) {
                        return formatFormatter.number(context.parsed.y, { style: 'currency', currency: 'TND' });
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
            <Bar data={chartData} options={options} />
        </div>
    );
}
