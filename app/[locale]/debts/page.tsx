"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Check, X, AlertCircle } from "lucide-react";
import { DebtDialog } from "@/components/debts/DebtDialog";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations, useFormatter } from "next-intl";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function DebtsPage() {
    const tCommon = useTranslations("common");
    return (
        <AppLayout>
            <SignedIn>
                <DebtsContent />
            </SignedIn>
            <SignedOut>
                <div className="flex min-h-[50vh] items-center justify-center">
                    <SignInButton mode="modal">
                        <Button size="lg" className="shadow-lg hover:shadow-primary/25">{tCommon("signIn")}</Button>
                    </SignInButton>
                </div>
            </SignedOut>
        </AppLayout>
    );
}

function DebtsContent() {
    const t = useTranslations("debts");
    const tCommon = useTranslations("common");
    const format = useFormatter();

    const debts = useQuery(api.debts.getDebts, {});
    const togglePaid = useMutation(api.debts.togglePaid);
    const deleteDebt = useMutation(api.debts.deleteDebt);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [filter, setFilter] = useState<"ALL" | "LENT" | "BORROWED">("ALL");

    const handleTogglePaid = async (id: Id<"debts">) => {
        try {
            await togglePaid({ id });
            toast.success(tCommon("success"));
        } catch (error) {
            toast.error(tCommon("error"));
        }
    };

    const handleDelete = async (id: Id<"debts">) => {
        if (confirm(tCommon("confirmDelete"))) {
            try {
                await deleteDebt({ id });
                toast.success(tCommon("delete") + " " + tCommon("success"));
            } catch (error) {
                toast.error(tCommon("error"));
            }
        }
    };

    const filteredDebts = debts?.filter((debt) => {
        if (filter === "ALL") return true;
        return debt.type === filter;
    }) || [];

    const lentDebts = debts?.filter((d) => d.type === "LENT") || [];
    const borrowedDebts = debts?.filter((d) => d.type === "BORROWED") || [];

    const totalLent = lentDebts.reduce((sum, d) => !d.isPaid ? sum + d.amount : sum, 0);
    const totalBorrowed = borrowedDebts.reduce((sum, d) => !d.isPaid ? sum + d.amount : sum, 0);

    return (
        <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t("title")}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t("subtitle")}
                        </p>
                    </div>
                    <Button size="lg" className="gap-2 shadow-lg hover:shadow-primary/25" onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-5 w-5" />
                        {t("addDebt")}
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{t("totalToReceive")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {format.number(totalLent, { style: 'currency', currency: 'TND' })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{lentDebts.filter(d => !d.isPaid).length} {t("active")}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{t("totalToPay")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {format.number(totalBorrowed, { style: 'currency', currency: 'TND' })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{borrowedDebts.filter(d => !d.isPaid).length} {t("active")}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-2">
                    <Button variant={filter === "ALL" ? "default" : "outline"} onClick={() => setFilter("ALL")}>
                        {t("all")}
                    </Button>
                    <Button variant={filter === "LENT" ? "default" : "outline"} onClick={() => setFilter("LENT")}>
                        {t("lent")}
                    </Button>
                    <Button variant={filter === "BORROWED" ? "default" : "outline"} onClick={() => setFilter("BORROWED")}>
                        {t("borrowed")}
                    </Button>
                </div>

                <div className="grid gap-4">
                    {!debts || filteredDebts.length === 0 ? (
                        <Card className="border-border/50 bg-card/50">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">{t("noDebts")}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredDebts.map((debt) => (
                            <Card
                                key={debt._id}
                                className={`border-border/50 backdrop-blur-sm shadow-sm transition-all ${debt.isPaid ? "bg-muted/30 opacity-60" : "bg-card/50"
                                    } ${debt.isOverdue && !debt.isPaid ? "border-destructive/50" : ""}`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold">{debt.personName}</h3>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full ${debt.type === "LENT"
                                                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                        }`}
                                                >
                                                    {debt.type === "LENT" ? t("lent") : t("borrowed")}
                                                </span>
                                                {debt.isPaid && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                                        {t("paid")}
                                                    </span>
                                                )}
                                                {debt.isOverdue && !debt.isPaid && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                                                        {t("overdue")}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-2xl font-bold mb-1">
                                                {format.number(debt.amount, { style: 'currency', currency: 'TND' })}
                                            </p>
                                            {debt.description && (
                                                <p className="text-sm text-muted-foreground mb-2">{debt.description}</p>
                                            )}
                                            {debt.dueDate && (
                                                <p className="text-xs text-muted-foreground">
                                                    {t("dueDate")}: {format.dateTime(new Date(debt.dueDate), { dateStyle: 'medium' })}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleTogglePaid(debt._id)}
                                                className={debt.isPaid ? "text-green-600" : "text-muted-foreground"}
                                            >
                                                {debt.isPaid ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(debt._id)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <DebtDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />
        </>
    );
}
