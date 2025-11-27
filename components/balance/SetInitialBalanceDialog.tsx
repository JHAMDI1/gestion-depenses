"use client";

import { useState, useEffect } from "react";
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

interface SetInitialBalanceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentAmount: number;
}

export function SetInitialBalanceDialog({ open, onOpenChange, currentAmount }: SetInitialBalanceDialogProps) {
    const setInitialBalance = useMutation(api.balance.setInitialBalance);
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setAmount(currentAmount.toString());
        }
    }, [open, currentAmount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amountValue = parseFloat(amount);
        if (isNaN(amountValue)) {
            toast.error("Montant invalide");
            return;
        }

        setIsSubmitting(true);

        try {
            await setInitialBalance({ amount: amountValue });
            toast.success("Solde initial mis à jour");
            onOpenChange(false);
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
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
                            Définir le solde initial
                        </DialogTitle>
                        <DialogDescription>
                            C'est le montant d'argent que vous aviez au départ. Ce montant sera utilisé pour calculer votre solde actuel.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="amount" className="text-sm font-medium text-foreground/80">
                                Montant initial (TND)
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                Exemple : Si vous aviez 1000 TND au début, entrez 1000
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                            <p className="text-xs text-muted-foreground">
                                💡 <strong>Info :</strong> Le solde actuel est calculé automatiquement :
                                <br />
                                Solde initial + Revenus - Dépenses + Emprunts - Prêts - Épargne
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="shadow-lg shadow-primary/20">
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
