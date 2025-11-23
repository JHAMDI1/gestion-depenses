"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface RecurringDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recurringToEdit?: {
        _id: Id<"recurrings">;
        name: string;
        amount: number;
        categoryId: Id<"categories">;
        dayOfMonth: number;
        isActive: boolean;
    } | null;
}

export function RecurringDialog({
    open,
    onOpenChange,
    recurringToEdit,
}: RecurringDialogProps) {
    const categories = useQuery(api.categories.getCategories);
    const createRecurring = useMutation(api.recurrings.createRecurring);
    const updateRecurring = useMutation(api.recurrings.updateRecurring);

    const [name, setName] = useState(recurringToEdit?.name || "");
    const [amount, setAmount] = useState(
        recurringToEdit?.amount.toString() || ""
    );
    const [categoryId, setCategoryId] = useState<string>(
        recurringToEdit?.categoryId || ""
    );
    const [dayOfMonth, setDayOfMonth] = useState(
        recurringToEdit?.dayOfMonth.toString() || "1"
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !amount || !categoryId || !dayOfMonth) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        setIsSubmitting(true);

        try {
            const recurringData = {
                name,
                amount: parseFloat(amount),
                categoryId: categoryId as Id<"categories">,
                dayOfMonth: parseInt(dayOfMonth),
            };

            if (recurringToEdit) {
                await updateRecurring({
                    id: recurringToEdit._id,
                    ...recurringData,
                    isActive: recurringToEdit.isActive,
                });
                toast.success("Dépense récurrente mise à jour !");
            } else {
                await createRecurring(recurringData);
                toast.success("Dépense récurrente créée avec succès !");
            }

            // Reset form if creating new
            if (!recurringToEdit) {
                setName("");
                setAmount("");
                setCategoryId("");
                setDayOfMonth("1");
            }
            onOpenChange(false);
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {recurringToEdit ? "Modifier la Récurrence" : "Nouvelle Récurrence"}
                        </DialogTitle>
                        <DialogDescription>
                            Ajoutez une dépense qui revient chaque mois (loyer, abonnement...).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Netflix, Loyer..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="grid gap-2">
                            <Label htmlFor="category">Catégorie</Label>
                            <Select
                                value={categoryId}
                                onValueChange={setCategoryId}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Sélectionner une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((category) => (
                                        <SelectItem key={category._id} value={category._id}>
                                            <div className="flex items-center gap-2">
                                                <span>{category.icon}</span>
                                                <span>{category.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Amount */}
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Montant (TND)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.001"
                                placeholder="0.000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        {/* Day of Month */}
                        <div className="grid gap-2">
                            <Label htmlFor="day">Jour du mois (1-31)</Label>
                            <Input
                                id="day"
                                type="number"
                                min="1"
                                max="31"
                                value={dayOfMonth}
                                onChange={(e) => setDayOfMonth(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
