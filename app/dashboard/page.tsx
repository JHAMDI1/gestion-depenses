"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, Wallet, AlertCircle, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";

export default function DashboardPage() {
    const monthlyTotal = useQuery(api.transactions.getMonthlyTotal);
    const recentTransactions = useQuery(api.transactions.getRecentTransactions);
    const categories = useQuery(api.categories.getCategories);
    const seedCategories = useMutation(api.categories.seedDefaultCategories);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Initialiser les catégories par défaut si aucune n'existe
    useEffect(() => {
        if (categories && categories.length === 0) {
            seedCategories();
        }
    }, [categories, seedCategories]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-TN", {
            style: "currency",
            currency: "TND",
            minimumFractionDigits: 3,
        }).format(amount);
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
                        <p className="text-muted-foreground">
                            Bienvenue sur Masrouf - Gérez vos finances en toute simplicité
                        </p>
                    </div>
                    <Button size="lg" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-5 w-5" />
                        Ajouter une Dépense
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total du Mois
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {monthlyTotal ? formatCurrency(monthlyTotal.total) : "0.000 TND"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {monthlyTotal?.count || 0} transaction(s)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Budget Restant
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">
                                Définissez vos budgets
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                Aucun budget dépassé
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transactions Récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!recentTransactions || recentTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <Receipt className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    Aucune transaction
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Commencez à suivre vos dépenses en ajoutant votre première
                                    transaction
                                </p>
                                <Button onClick={() => setIsAddDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter une Dépense
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction._id}
                                        className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-full"
                                                style={{
                                                    backgroundColor: transaction.category?.color + "20",
                                                }}
                                            >
                                                <span className="text-lg">
                                                    {transaction.category?.icon || "📦"}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{transaction.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.category?.name || "Sans catégorie"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {formatCurrency(transaction.amount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(transaction.date).toLocaleDateString("fr-FR")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add Transaction Dialog */}
            <AddTransactionDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />
        </AppLayout>
    );
}
