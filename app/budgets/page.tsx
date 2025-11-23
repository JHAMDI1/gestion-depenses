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

export default function BudgetsPage() {
    const budgets = useQuery(api.budgets.getBudgets);
    const deleteBudget = useMutation(api.budgets.deleteBudget);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<{
        _id: Id<"budgets">;
        categoryId: Id<"categories">;
        monthlyLimit: number;
    } | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-TN", {
            style: "currency",
            currency: "TND",
            minimumFractionDigits: 3,
        }).format(amount);
    };

    const handleDelete = async (id: Id<"budgets">) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce budget ?")) {
            try {
                await deleteBudget({ id });
                toast.success("Budget supprimé");
            } catch (error) {
                toast.error("Erreur lors de la suppression");
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
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Budgets</h1>
                        <p className="text-muted-foreground">
                            Définissez et suivez vos limites de dépenses mensuelles
                        </p>
                    </div>
                    <Button size="lg" className="gap-2" onClick={handleAdd}>
                        <Plus className="h-5 w-5" />
                        Définir un Budget
                    </Button>
                </div>

                {/* Budgets List */}
                {!budgets || budgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border border-border">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Aucun budget défini</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Commencez à contrôler vos dépenses en définissant des limites par
                            catégorie
                        </p>
                        <Button onClick={handleAdd}>
                            <Plus className="mr-2 h-4 w-4" />
                            Définir un Budget
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {budgets.map((budget) => {
                            const isOverBudget = budget.spent > budget.monthlyLimit;
                            const progressColor = isOverBudget
                                ? "bg-destructive"
                                : budget.percentage > 80
                                    ? "bg-yellow-500"
                                    : "bg-primary";

                            return (
                                <Card key={budget._id} className="overflow-hidden">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                                                style={{
                                                    backgroundColor: budget.category?.color + "20",
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
                                                <span className="text-muted-foreground">Dépensé</span>
                                                <span className="font-medium">
                                                    {formatCurrency(budget.spent)}
                                                </span>
                                            </div>

                                            <Progress
                                                value={Math.min(budget.percentage, 100)}
                                                className="h-2"
                                                indicatorClassName={progressColor}
                                            />

                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Limite : {formatCurrency(budget.monthlyLimit)}
                                                </span>
                                                <span
                                                    className={
                                                        isOverBudget
                                                            ? "text-destructive font-medium"
                                                            : "text-green-500 font-medium"
                                                    }
                                                >
                                                    {isOverBudget
                                                        ? `+${formatCurrency(budget.spent - budget.monthlyLimit)}`
                                                        : `${formatCurrency(budget.remaining)} restants`}
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
        </AppLayout>
    );
}
