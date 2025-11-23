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

interface AddTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({
    open,
    onOpenChange,
}: AddTransactionDialogProps) {
    const categories = useQuery(api.categories.getCategories);
    const createTransaction = useMutation(api.transactions.createTransaction);

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState<Id<"categories"> | "">("");
    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !amount || !categoryId) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        setIsSubmitting(true);

        try {
            await createTransaction({
                name,
                amount: parseFloat(amount),
                categoryId: categoryId as Id<"categories">,
                date: new Date(date).getTime(),
            });

            toast.success("Transaction ajoutée avec succès !");

            // Reset form
            setName("");
            setAmount("");
            setCategoryId("");
            setDate(new Date().toISOString().split("T")[0]);
            onOpenChange(false);
        } catch (error) {
            toast.error("Erreur lors de l'ajout de la transaction");
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
                        <DialogTitle>Ajouter une Dépense</DialogTitle>
                        <DialogDescription>
                            Enregistrez une nouvelle transaction pour suivre vos dépenses.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Category */}
                        <div className="grid gap-2">
                            <Label htmlFor="category">Catégorie</Label>
                            <Select
                                value={categoryId}
                                onValueChange={(value) => setCategoryId(value as Id<"categories">)}
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

                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Description</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Courses du mois"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
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

                        {/* Date */}
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
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
                            {isSubmitting ? "Ajout..." : "Ajouter"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
