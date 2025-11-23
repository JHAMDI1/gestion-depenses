"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, Target, Trophy } from "lucide-react";
import { GoalDialog } from "@/components/goals/GoalDialog";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function GoalsPage() {
    const goals = useQuery(api.goals.getGoals);
    const deleteGoal = useMutation(api.goals.deleteGoal);
    const updateGoalAmount = useMutation(api.goals.updateSavedAmount);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<{
        _id: Id<"goals">;
        name: string;
        targetAmount: number;
        savedAmount: number;
        deadline?: number;
    } | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-TN", {
            style: "currency",
            currency: "TND",
            minimumFractionDigits: 3,
        }).format(amount);
    };

    const handleDelete = async (id: Id<"goals">) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet objectif ?")) {
            try {
                await deleteGoal({ id });
                toast.success("Objectif supprimé");
            } catch (error) {
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    const handleEdit = (goal: any) => {
        setGoalToEdit({
            _id: goal._id,
            name: goal.name,
            targetAmount: goal.targetAmount,
            savedAmount: goal.savedAmount,
            deadline: goal.deadline,
        });
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setGoalToEdit(null);
        setIsDialogOpen(true);
    };

    const handleAddSavings = async (id: Id<"goals">, currentAmount: number) => {
        const amountStr = prompt("Montant à ajouter à l'épargne (TND) :");
        if (amountStr) {
            const amount = parseFloat(amountStr);
            if (!isNaN(amount)) {
                try {
                    await updateGoalAmount({ id, savedAmount: currentAmount + amount });
                    toast.success("Épargne mise à jour !");
                } catch (error) {
                    toast.error("Erreur lors de la mise à jour");
                }
            }
        }
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Objectifs</h1>
                        <p className="text-muted-foreground">
                            Épargnez pour vos projets futurs
                        </p>
                    </div>
                    <Button size="lg" className="gap-2" onClick={handleAdd}>
                        <Plus className="h-5 w-5" />
                        Nouvel Objectif
                    </Button>
                </div>

                {/* Goals List */}
                {!goals || goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border border-border">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Target className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Aucun objectif défini</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Fixez-vous des objectifs financiers pour réaliser vos projets
                        </p>
                        <Button onClick={handleAdd}>
                            <Plus className="mr-2 h-4 w-4" />
                            Créer un Objectif
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {goals.map((goal) => {
                            const percentage = Math.min(
                                (goal.savedAmount / goal.targetAmount) * 100,
                                100
                            );
                            const isCompleted = percentage >= 100;

                            return (
                                <Card key={goal._id} className={isCompleted ? "border-green-500/50 bg-green-500/5" : ""}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center gap-2">
                                            {isCompleted ? (
                                                <Trophy className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <Target className="h-5 w-5 text-primary" />
                                            )}
                                            <CardTitle className="text-base font-medium">
                                                {goal.name}
                                            </CardTitle>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(goal)}
                                            >
                                                <Edit className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(goal._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Épargné</span>
                                                <span className="font-medium">
                                                    {formatCurrency(goal.savedAmount)}
                                                </span>
                                            </div>

                                            <Progress
                                                value={percentage}
                                                className="h-2"
                                                indicatorClassName={isCompleted ? "bg-green-500" : "bg-primary"}
                                            />

                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Cible : {formatCurrency(goal.targetAmount)}
                                                </span>
                                                <span className="font-medium">
                                                    {percentage.toFixed(0)}%
                                                </span>
                                            </div>

                                            {goal.deadline && (
                                                <p className="text-xs text-muted-foreground text-right">
                                                    Date limite : {format(new Date(goal.deadline), "dd MMM yyyy", { locale: fr })}
                                                </p>
                                            )}

                                            {!isCompleted && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full mt-2"
                                                    onClick={() => handleAddSavings(goal._id, goal.savedAmount)}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Ajouter de l'épargne
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <GoalDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                goalToEdit={goalToEdit}
            />
        </AppLayout>
    );
}
