"use client";

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
import { useFormatter } from "next-intl";

interface CategoryDistributionChartProps {
    filter: "EXPENSE" | "INCOME" | "ALL";
    comparisonSeries: any[];
    displayData: any[];
}

export function CategoryDistributionChart({ filter, comparisonSeries, displayData }: CategoryDistributionChartProps) {
    const formatFormatter = useFormatter();

    if (filter === "ALL") {
        return (
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonSeries}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="month"
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
                        <Legend />
                        <Bar dataKey="income" fill="#10b981" name="Revenus" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#ef4444" name="Dépenses" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return (
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={displayData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {displayData.map((entry: { color?: string }, index: number) => (
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
    );
}
