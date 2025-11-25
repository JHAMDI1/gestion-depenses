"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { BudgetDialog } from "@/components/budgets/BudgetDialog";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations, useFormatter } from "next-intl";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function BudgetsPage() {
    const tCommon = useTranslations("common");
    return (
        <AppLayout>
            <SignedIn>
                <BudgetsContent />
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

function BudgetsContent() {
    const t = useTranslations("budgets");
    const tCommon = useTranslations("common");
    const format = useFormatter();

    const budgets = useQuery(api.budgets.getBudgets, {});
    const deleteBudget = useMutation(api.budgets.deleteBudget);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<{
        _id: Id<"budgets">;
        categoryId: Id<"categories">;
        monthlyLimit: number;
    } | null>(null);

    const handleDelete = async (id: Id<"budgets">) => {
        if (confirm(tCommon("confirmDelete"))) {
            try {
                await deleteBudget({ id });
                toast.success(tCommon("delete") + " " + tCommon("success"));
            } catch (error) {
                toast.error(tCommon("error"));
            }
        }
    };

    const handleEdit = (budget: any) => {
        setBudgetToEdit({
            _id: budget._id,
            categoryId: budget.categoryId,
            monthlyLimit: budget.monthlyLimit,
        });
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setBudgetToEdit(null);
        setIsDialogOpen(true);
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{t("title")}</h1>
                        <p className="text-muted-foreground">
                            {t("subtitle")}
                        </p>
                    </div>
                    <Button size="lg" className="gap-2" onClick={handleAdd}>
                        <Plus className="h-5 w-5" />
                        {t("defineBudget")}
                    </Button>
                </div>

                {!budgets || budgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border border-border">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{t("noBudgets")}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t("startTracking")}
                        </p>
                        <Button onClick={handleAdd}>
                            <Plus className="me-2 h-4 w-4" />
                            {t("defineBudget")}
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {budgets.map((budget) => {
                            const isOverBudget = budget.spent > budget.monthlyLimit;
                            const progressColor = isOverBudget
                                ? "bg-destructive"
                                : budget.percentage > 80
                                    ? "bg-[var(--color-warning)]"
                                    : "bg-primary";

                            return (
                                <Card key={budget._id} className="overflow-hidden">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors duration-200 ease-out"
                                                style={{
                                                    backgroundColor: budget.category?.color
                                                        ? `${budget.category.color}20`
                                                        : 'var(--color-muted)',
                                                }}
                                            >
                                                {budget.category?.icon}
                                            </span>
                                            <CardTitle className="text-base font-medium">
                                                {budget.category?.name}
                                            </CardTitle>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(budget)}
                                            >
                                                <Edit className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(budget._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{t("spent")}</span>
                                                <span className="font-medium">
                                                    {format.number(budget.spent, { style: 'currency', currency: 'TND' })}
                                                </span>
                                            </div>

                                            <Progress
                                                value={Math.min(budget.percentage, 100)}
                                                className="h-2"
                                                indicatorClassName={progressColor}
                                            />

                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {t("limit")} : {format.number(budget.monthlyLimit, { style: 'currency', currency: 'TND' })}
                                                </span>
                                                <span
                                                    className={
                                                        isOverBudget
                                                            ? "text-destructive font-medium"
                                                            : "text-[var(--color-success)] font-medium"
                                                    }
                                                >
                                                    {isOverBudget
                                                        ? `+${format.number(budget.spent - budget.monthlyLimit, { style: 'currency', currency: 'TND' })}`
                                                        : `${format.number(budget.remaining, { style: 'currency', currency: 'TND' })} ${t("remaining")}`}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <BudgetDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                budgetToEdit={budgetToEdit}
            />
        </>
    );
}
