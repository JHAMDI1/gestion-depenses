"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Repeat, CalendarClock } from "lucide-react";
import { RecurringDialog } from "@/components/recurrings/RecurringDialog";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function RecurringsPage() {
    const recurrings = useQuery(api.recurrings.getRecurrings);
    const deleteRecurring = useMutation(api.recurrings.deleteRecurring);
    const toggleRecurring = useMutation(api.recurrings.toggleRecurring);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [recurringToEdit, setRecurringToEdit] = useState<{
        _id: Id<"recurrings">;
        name: string;
        amount: number;
        categoryId: Id<"categories">;
        dayOfMonth: number;
        isActive: boolean;
    } | null>(null);

    // ...

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-TN", {
            style: "currency",
            currency: "TND",
            minimumFractionDigits: 3,
        }).format(amount);
    };

    const handleDelete = async (id: Id<"recurrings">) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense récurrente ?")) {
            try {
                await deleteRecurring({ id });
                toast.success("Dépense supprimée");
            } catch (error) {
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    const handleToggle = async (id: Id<"recurrings">, isActive: boolean) => {
        try {
            await toggleRecurring({ id, isActive });
            toast.success(isActive ? "Récurrence activée" : "Récurrence désactivée");
        } catch (error) {
            toast.error("Erreur lors de la modification");
        }
    };

    const handleEdit = (recurring: any) => {
        setRecurringToEdit({
            _id: recurring._id,
            name: recurring.name,
            amount: recurring.amount,
            categoryId: recurring.categoryId,
            dayOfMonth: recurring.dayOfMonth,
            isActive: recurring.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setRecurringToEdit(null);
        setIsDialogOpen(true);
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dépenses Récurrentes</h1>
                        <p className="text-muted-foreground">
                            Gérez vos abonnements et charges fixes mensuelles
                        </p>
                    </div>
                    <Button size="lg" className="gap-2" onClick={handleAdd}>
                        <Plus className="h-5 w-5" />
                        Ajouter une Récurrence
                    </Button>
                </div>

                {/* Recurrings List */}
                {!recurrings || recurrings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border border-border">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Repeat className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Aucune dépense récurrente</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Ajoutez vos charges fixes (loyer, internet, abonnements) pour ne rien oublier
                        </p>
                        <Button onClick={handleAdd}>
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter une Récurrence
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recurrings.map((recurring) => (
                            <Card key={recurring._id} className={!recurring.isActive ? "opacity-60" : ""}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                                            style={{
                                                backgroundColor: recurring.category?.color + "20",
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
                                                <p className="text-2xl font-bold">
                                                    {formatCurrency(recurring.amount)}
                                                </p>
                                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                    <CalendarClock className="mr-1 h-3 w-3" />
                                                    Le {recurring.dayOfMonth} du mois
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2 border-t border-border">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(recurring)}
                                            >
                                                <Edit className="mr-2 h-3 w-3" />
                                                Modifier
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(recurring._id)}
                                            >
                                                <Trash2 className="mr-2 h-3 w-3" />
                                                Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <RecurringDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                recurringToEdit={recurringToEdit}
            />
        </AppLayout>
    );
}
