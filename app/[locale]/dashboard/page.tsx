"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, Wallet, AlertCircle, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { useTranslations, useFormatter, useLocale } from "next-intl";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function DashboardPage() {
    const tCommon = useTranslations("common");
    return (
        <AppLayout>
            <SignedIn>
                <DashboardContent />
            </SignedIn>
            <SignedOut>
                <div className="flex min-h-[50vh] items-center justify-center">
                    <SignInButton mode="modal">
                        <Button size="lg">{tCommon("signIn")}</Button>
                    </SignInButton>
                </div>
            </SignedOut>
        </AppLayout>
    );
}

function DashboardContent() {
    const t = useTranslations("dashboard");
    const tCommon = useTranslations("common");
    const tTrans = useTranslations("transactions");
    const format = useFormatter();
    const locale = useLocale();

    const monthlyTotal = useQuery(api.transactions.getMonthlyTotal, {});
    const recentTransactions = useQuery(api.transactions.getRecentTransactions, {});
    const categories = useQuery(api.categories.getCategories, {});
    const seedCategories = useMutation(api.categories.seedDefaultCategories);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    useEffect(() => {
        if (categories && categories.length === 0) {
            seedCategories({ locale });
        }
    }, [categories, seedCategories, locale]);

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{t("title")}</h1>
                        <p className="text-muted-foreground">
                            {tCommon("appName")} - {t("monthSummary")}
                        </p>
                    </div>
                    <Button size="lg" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-5 w-5" />
                        {t("addExpense")}
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t("totalSpent")}
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {monthlyTotal ? format.number(monthlyTotal.total, { style: 'currency', currency: 'TND' }) : format.number(0, { style: 'currency', currency: 'TND' })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {monthlyTotal?.count || 0} transaction(s)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t("remainingBudget")}
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">
                                {t("remainingBudget")}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("alerts")}</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                {t("noBudgetExceeded")}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("recentTransactions")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!recentTransactions || recentTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <Receipt className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {tTrans("noTransactions")}
                                </h3>
                                <Button onClick={() => setIsAddDialogOpen(true)}>
                                    <Plus className="me-2 h-4 w-4" />
                                    {t("addExpense")}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction._id}
                                        className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0 transition-colors duration-200 ease-out"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ease-out"
                                                style={{
                                                    backgroundColor: transaction.category?.color
                                                        ? `${transaction.category.color}20`
                                                        : 'var(--color-muted)',
                                                }}
                                            >
                                                <span className="text-lg">
                                                    {transaction.category?.icon || "📦"}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{transaction.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.category?.name || tCommon("uncategorized")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <p className="font-semibold">
                                                {format.number(transaction.amount, { style: 'currency', currency: 'TND' })}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format.dateTime(new Date(transaction.date), { dateStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AddTransactionDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />
        </>
    );
}
