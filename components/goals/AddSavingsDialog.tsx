"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Id } from "@/convex/_generated/dataModel";

interface AddSavingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    goalId: Id<"goals"> | null;
}

export function AddSavingsDialog({ open, onOpenChange, goalId }: AddSavingsDialogProps) {
    const t = useTranslations("goals");
    const tCommon = useTranslations("common");
    const addSavings = useMutation(api.goals.addSavings);

    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!goalId || !amount || parseFloat(amount) <= 0) {
            toast.error("Montant invalide");
            return;
        }

        setIsSubmitting(true);

        try {
            await addSavings({
                id: goalId,
                amount: parseFloat(amount),
            });
            toast.success(t("savingsUpdated"));
            setAmount("");
            onOpenChange(false);
        } catch (error) {
            toast.error(tCommon("error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent w-fit">
                            {t("addSavings")}
                        </DialogTitle>
                        <DialogDescription>
                            Ajoutez un montant à votre épargne
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="amount" className="text-sm font-medium text-foreground/80">
                                Montant à ajouter
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {tCommon("cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="shadow-lg shadow-primary/20">
                            {tCommon("add")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
