"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, Target, Trophy, Minus } from "lucide-react";
import { GoalDialog } from "@/components/goals/GoalDialog";
import { AddSavingsDialog } from "@/components/goals/AddSavingsDialog";
import { WithdrawSavingsDialog } from "@/components/goals/WithdrawSavingsDialog";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations, useFormatter } from "next-intl";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function GoalsPage() {
    const tCommon = useTranslations("common");
    return (
        <AppLayout>
            <SignedIn>
                <GoalsContent />
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

function GoalsContent() {
    const t = useTranslations("goals");
    const tCommon = useTranslations("common");
    const format = useFormatter();

    const goals = useQuery(api.goals.getGoals);
    const deleteGoal = useMutation(api.goals.deleteGoal);
    const updateGoalAmount = useMutation(api.goals.updateSavedAmount);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
    const [isWithdrawSavingsOpen, setIsWithdrawSavingsOpen] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState<Id<"goals"> | null>(null);
    const [selectedGoalSaved, setSelectedGoalSaved] = useState(0);
    const [goalToEdit, setGoalToEdit] = useState<{
        _id: Id<"goals">;
        name: string;
        targetAmount: number;
        savedAmount: number;
        deadline?: number;
    } | null>(null);

    const handleDelete = async (id: Id<"goals">) => {
        if (confirm(tCommon("confirmDelete"))) {
            try {
                await deleteGoal({ id });
                toast.success(tCommon("delete") + " " + tCommon("success"));
            } catch (error) {
                toast.error(tCommon("error"));
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

    const handleAddSavings = (id: Id<"goals">) => {
        setSelectedGoalId(id);
        setIsAddSavingsOpen(true);
    };

    const handleWithdrawSavings = (id: Id<"goals">, savedAmount: number) => {
        setSelectedGoalId(id);
        setSelectedGoalSaved(savedAmount);
        setIsWithdrawSavingsOpen(true);
    };

    return (
        <>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{t("title")}</h1>
                        <p className="text-muted-foreground">
                            {t("subtitle")}
                        </p>
                    </div>
                    <Button size="lg" className="gap-2" onClick={handleAdd}>
                        <Plus className="h-5 w-5" />
                        {t("newGoal")}
                    </Button>
                </div>

                {/* Goals List */}
                {!goals || goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border border-border">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Target className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{t("noGoals")}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t("startSaving")}
                        </p>
                        <Button onClick={handleAdd}>
                            <Plus className="me-2 h-4 w-4" />
                            {t("createGoal")}
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
                                                <span className="text-muted-foreground">{t("saved")}</span>
                                                <span className="font-medium">
                                                    {format.number(goal.savedAmount, { style: 'currency', currency: 'TND' })}
                                                </span>
                                            </div>

                                            <Progress
                                                value={percentage}
                                                className="h-2"
                                                indicatorClassName={isCompleted ? "bg-green-500" : "bg-primary"}
                                            />

                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {t("target")} : {format.number(goal.targetAmount, { style: 'currency', currency: 'TND' })}
                                                </span>
                                                <span className="font-medium">
                                                    {percentage.toFixed(0)}%
                                                </span>
                                            </div>

                                            {goal.deadline && (
                                                <p className="text-xs text-muted-foreground text-end">
                                                    {t("deadline")} : {format.dateTime(new Date(goal.deadline), { dateStyle: 'medium' })}
                                                </p>
                                            )}

                                            {!isCompleted && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 mt-2"
                                                        onClick={() => handleAddSavings(goal._id)}
                                                    >
                                                        <Plus className="me-2 h-4 w-4" />
                                                        {t("addSavings")}
                                                    </Button>
                                                    {goal.savedAmount > 0 && (
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 mt-2"
                                                            onClick={() => handleWithdrawSavings(goal._id, goal.savedAmount)}
                                                        >
                                                            <Minus className="me-2 h-4 w-4" />
                                                            Retirer
                                                        </Button>
                                                    )}
                                                </div>
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

            <AddSavingsDialog
                open={isAddSavingsOpen}
                onOpenChange={setIsAddSavingsOpen}
                goalId={selectedGoalId}
            />

            <WithdrawSavingsDialog
                open={isWithdrawSavingsOpen}
                onOpenChange={setIsWithdrawSavingsOpen}
                goalId={selectedGoalId}
                currentSaved={selectedGoalSaved}
            />
        </>
    );
}
