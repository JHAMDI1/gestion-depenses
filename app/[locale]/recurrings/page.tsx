"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Repeat, CalendarClock, Zap } from "lucide-react";
import { RecurringDialog } from "@/components/recurrings/RecurringDialog";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations, useFormatter } from "next-intl";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function RecurringsPage() {
    const tCommon = useTranslations("common");
    return (
        <AppLayout>
            <SignedIn>
                <RecurringsContent />
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

function RecurringsContent() {
    const t = useTranslations("recurrings");
    const tCommon = useTranslations("common");
    const format = useFormatter();

    const recurrings = useQuery(api.recurrings.getRecurrings);
    const deleteRecurring = useMutation(api.recurrings.deleteRecurring);
    const toggleRecurring = useMutation(api.recurrings.toggleRecurring);
    const generateTransaction = useMutation(api.recurring_generator.generateTransactionFromRecurring);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
    const [recurringToEdit, setRecurringToEdit] = useState<{
        _id: Id<"recurrings">;
        name: string;
        amount: number;
        categoryId: Id<"categories">;
        type?: string;
        frequency?: string;
        dayOfWeek?: number;
        dayOfMonth?: number;
        isActive: boolean;
    } | null>(null);

    const filteredRecurrings = recurrings?.filter((recurring) => {
        if (filter === "ALL") return true;
        return (recurring.type || "EXPENSE") === filter;
    });

    const handleDelete = async (id: Id<"recurrings">) => {
        if (confirm(tCommon("confirmDelete"))) {
            try {
                await deleteRecurring({ id });
                toast.success(tCommon("delete") + " " + tCommon("success"));
            } catch (error) {
                toast.error(tCommon("error"));
            }
        }
    };

    const handleToggle = async (id: Id<"recurrings">, isActive: boolean) => {
        try {
            await toggleRecurring({ id, isActive });
            toast.success(isActive ? t("activated") : t("deactivated"));
        } catch (error) {
            toast.error(tCommon("error"));
        }
    };

    const handleEdit = (recurring: any) => {
        setRecurringToEdit({
            _id: recurring._id,
            name: recurring.name,
            amount: recurring.amount,
            categoryId: recurring.categoryId,
            type: recurring.type,
            frequency: recurring.frequency,
            dayOfWeek: recurring.dayOfWeek,
            dayOfMonth: recurring.dayOfMonth,
            isActive: recurring.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setRecurringToEdit(null);
        setIsDialogOpen(true);
    };

    const handleGenerate = async (id: Id<"recurrings">) => {
        try {
            await generateTransaction({ recurringId: id });
            toast.success("Transaction générée avec succès!");
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la génération");
        }
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
                        {t("newRecurring")}
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <Button variant={filter === "ALL" ? "default" : "outline"} onClick={() => setFilter("ALL")}>
                        {t("all")}
                    </Button>
                    <Button variant={filter === "INCOME" ? "default" : "outline"} onClick={() => setFilter("INCOME")}>
                        {tCommon("income")}
                    </Button>
                    <Button variant={filter === "EXPENSE" ? "default" : "outline"} onClick={() => setFilter("EXPENSE")}>
                        {tCommon("expense")}
                    </Button>
                </div>

                {/* Recurrings List */}
                {!filteredRecurrings || filteredRecurrings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border border-border">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Repeat className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{t("noRecurrings")}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t("startTracking")}
                        </p>
                        <Button onClick={handleAdd}>
                            <Plus className="me-2 h-4 w-4" />
                            {t("createRecurring")}
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredRecurrings.map((recurring) => {
                            const recurringType = recurring.type || "EXPENSE";
                            const frequency = recurring.frequency || "MONTHLY";
                            const dayInfo = frequency === "WEEKLY" || frequency === "BIWEEKLY"
                                ? `${t("dayOfWeek")}: ${recurring.dayOfWeek !== undefined ? ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][recurring.dayOfWeek] : "-"}`
                                : `${t("dayOfMonth", { day: recurring.dayOfMonth || 1 })}`;

                            return (
                                <Card key={recurring._id} className={!recurring.isActive ? "opacity-60" : ""}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors duration-200 ease-out"
                                                style={{
                                                    backgroundColor: recurring.category?.color
                                                        ? `${recurring.category.color}20`
                                                        : 'var(--color-muted)',
                                                }}
                                            >
                                                {recurring.category?.icon}
                                            </span>
                                            <CardTitle className="text-base font-medium">
                                                {recurring.name}
                                            </CardTitle>
                                        </div>
                                        <Switch
                                            checked={recurring.isActive}
                                            onCheckedChange={(checked) => handleToggle(recurring._id, checked)}
                                        />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-2xl font-bold">
                                                            {format.number(recurring.amount, { style: 'currency', currency: 'TND' })}
                                                        </p>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full ${recurringType === "INCOME"
                                                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                                }`}
                                                        >
                                                            {recurringType === "INCOME" ? tCommon("income") : tCommon("expense")}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground space-y-1">
                                                        <div className="flex items-center">
                                                            <Repeat className="me-1 h-3 w-3" />
                                                            {t(`frequencies.${frequency}`)}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <CalendarClock className="me-1 h-3 w-3" />
                                                            {dayInfo}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2 border-t border-border">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleGenerate(recurring._id)}
                                                    className="gap-1"
                                                >
                                                    <Zap className="h-3 w-3" />
                                                    Générer
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(recurring)}
                                                >
                                                    <Edit className="me-2 h-3 w-3" />
                                                    {tCommon("edit")}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(recurring._id)}
                                                >
                                                    <Trash2 className="me-2 h-3 w-3" />
                                                    {tCommon("delete")}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            <RecurringDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                recurringToEdit={recurringToEdit}
            />
        </>
    );
}
