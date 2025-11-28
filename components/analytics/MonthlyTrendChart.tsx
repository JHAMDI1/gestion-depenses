"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useFormatter } from "next-intl";

interface MonthlyTrendChartProps {
    data: { name: string; amount: number; date: Date }[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
    const formatFormatter = useFormatter();

    return (
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
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
    );
}
