"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { startOfMonth, subMonths, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, TrendingUp, PieChart as PieChartIcon } from "lucide-react";

export default function StatsPage() {
    const [timeRange, setTimeRange] = useState("6"); // 6 derniers mois par défaut

    // Récupérer toutes les transactions pour les calculs
    // Note: Dans une vraie app avec beaucoup de données, on ferait ces agrégations côté backend (Convex)
    const transactions = useQuery(api.transactions.getTransactions, { limit: 1000 });
    const categories = useQuery(api.categories.getCategories);

    if (!transactions || !categories) {
        return (
            <AppLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }

    // Préparer les données pour le Pie Chart (Dépenses par catégorie)
    const expensesByCategory = categories.map((cat) => {
        const amount = transactions
            .filter((t) => t.categoryId === cat._id)
            .reduce((sum, t) => sum + t.amount, 0);
        return {
            name: cat.name,
            value: amount,
            color: cat.color,
        };
    }).filter(item => item.value > 0);

    // Préparer les données pour le Bar Chart (Dépenses par mois)
    const lastXMonths = Array.from({ length: parseInt(timeRange) }).map((_, i) => {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, "yyyy-MM");
        const monthLabel = format(date, "MMM", { locale: fr });

        const amount = transactions
            .filter((t) => format(new Date(t.date), "yyyy-MM") === monthKey)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            name: monthLabel,
            amount: amount,
            date: date, // pour le tri
        };
    }).reverse();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-TN", {
            style: "currency",
            currency: "TND",
            minimumFractionDigits: 3,
        }).format(amount);
    };

    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageMonthly = totalExpenses / (parseInt(timeRange) || 1); // Approximation simple

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Statistiques</h1>
                        <p className="text-muted-foreground">
                            Analysez vos habitudes de dépenses
                        </p>
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Période" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3">3 derniers mois</SelectItem>
                            <SelectItem value="6">6 derniers mois</SelectItem>
                            <SelectItem value="12">12 derniers mois</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* KPIs */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Dépenses (Période)
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(totalExpenses)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Moyenne Mensuelle
                            </CardTitle>
                            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(averageMonthly)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Monthly Trend */}
                    <Card className="col-span-2 lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Évolution Mensuelle</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={lastXMonths}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value} TND`}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                        />
                                        <Bar
                                            dataKey="amount"
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Distribution */}
                    <Card className="col-span-2 lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Répartition par Catégorie</CardTitle>
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
                                            {expensesByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
