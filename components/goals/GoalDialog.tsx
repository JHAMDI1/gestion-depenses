"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GoalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    goalToEdit?: {
        _id: Id<"goals">;
        name: string;
        targetAmount: number;
        savedAmount: number;
        deadline?: number;
    } | null;
}

export function GoalDialog({
    open,
    onOpenChange,
    goalToEdit,
}: GoalDialogProps) {
    const createGoal = useMutation(api.goals.createGoal);
    const updateGoal = useMutation(api.goals.updateGoal);

    const [name, setName] = useState(goalToEdit?.name || "");
    const [targetAmount, setTargetAmount] = useState(
        goalToEdit?.targetAmount.toString() || ""
    );
    const [savedAmount, setSavedAmount] = useState(
        goalToEdit?.savedAmount.toString() || "0"
    );
    const [deadline, setDeadline] = useState<Date | undefined>(
        goalToEdit?.deadline ? new Date(goalToEdit.deadline) : undefined
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !targetAmount) {
            toast.error("Veuillez remplir le nom et le montant cible");
            return;
        }

        setIsSubmitting(true);

        try {
            const goalData = {
                name,
                targetAmount: parseFloat(targetAmount),
                savedAmount: parseFloat(savedAmount) || 0,
                deadline: deadline ? deadline.getTime() : undefined,
            };

            if (goalToEdit) {
                await updateGoal({
                    id: goalToEdit._id,
                    ...goalData,
                });
                toast.success("Objectif mis à jour !");
            } else {
                await createGoal(goalData);
                toast.success("Objectif créé avec succès !");
            }

            // Reset form if creating new
            if (!goalToEdit) {
                setName("");
                setTargetAmount("");
                setSavedAmount("0");
                setDeadline(undefined);
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
                            {goalToEdit ? "Modifier l'Objectif" : "Nouvel Objectif"}
                        </DialogTitle>
                        <DialogDescription>
                            Définissez un objectif d'épargne et suivez votre progression.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom de l'objectif</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Vacances, Voiture..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Target Amount */}
                        <div className="grid gap-2">
                            <Label htmlFor="target">Montant Cible (TND)</Label>
                            <Input
                                id="target"
                                type="number"
                                step="0.001"
                                placeholder="0.000"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                required
                            />
                        </div>

                        {/* Saved Amount */}
                        <div className="grid gap-2">
                            <Label htmlFor="saved">Déjà Épargné (TND)</Label>
                            <Input
                                id="saved"
                                type="number"
                                step="0.001"
                                placeholder="0.000"
                                value={savedAmount}
                                onChange={(e) => setSavedAmount(e.target.value)}
                            />
                        </div>

                        {/* Deadline */}
                        <div className="grid gap-2">
                            <Label>Date limite (Optionnel)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !deadline && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {deadline ? (
                                            format(deadline, "PPP", { locale: fr })
                                        ) : (
                                            <span>Choisir une date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={deadline}
                                        onSelect={setDeadline}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
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
