"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { useTranslations, useFormatter, useLocale } from "next-intl";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { BalanceCard } from "@/components/balance/BalanceCard";
import { TransactionListSkeleton } from "@/components/shared/TransactionSkeleton";
import PageTransition from "@/components/shared/PageTransition";

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
    const budgets = useQuery(api.budgets.getBudgets, {});
    const seedCategories = useMutation(api.categories.seedDefaultCategories);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    useEffect(() => {
        if (categories && categories.length === 0) {
            seedCategories({ locale });
        }
    }, [categories, seedCategories, locale]);

    return (
        <>
            <PageTransition className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t("title")}</h1>
                        <p className="text-muted-foreground mt-1">
                            {tCommon("appName")} - {t("monthSummary")}
                        </p>
                    </div>
                    <Button size="lg" className="gap-2 shadow-lg hover:shadow-primary/25" onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-5 w-5" />
                        {t("addExpense")}
                    </Button>
                </div>

                <BalanceCard />

                <StatsCards monthlyTotal={monthlyTotal} budgets={budgets} />

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 lg:col-span-4 border-none shadow-none bg-transparent">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold tracking-tight">{t("recentTransactions")}</h2>
                        </div>
                        <div className="space-y-4">
                            {!recentTransactions ? (
                                <TransactionListSkeleton count={3} />
                            ) : recentTransactions.length === 0 ? (
                                <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <Receipt className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        {tTrans("noTransactions")}
                                    </h3>
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                                        <Plus className="me-2 h-4 w-4" />
                                        {t("addExpense")}
                                    </Button>
                                </Card>
                            ) : (
                                recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction._id}
                                        className="group flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
                                                style={{
                                                    backgroundColor: transaction.category?.color
                                                        ? `${transaction.category.color}15`
                                                        : 'var(--color-muted)',
                                                }}
                                            >
                                                <span className="text-xl">
                                                    {transaction.category?.icon || "📦"}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-base">{transaction.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.category?.name || tCommon("uncategorized")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <p className="font-bold text-base">
                                                {format.number(transaction.amount, { style: 'currency', currency: 'TND' })}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format.dateTime(new Date(transaction.date), { dateStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Placeholder for Charts/Analysis in the future */}
                    <div className="col-span-3 lg:col-span-3 space-y-8">
                        {/* We can add a chart here later */}
                    </div>
                </div>
            </PageTransition>

            <AddTransactionDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />
        </>
    );
}
