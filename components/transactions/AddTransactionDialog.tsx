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
import { useTranslations } from "next-intl";

interface AddTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({
    open,
    onOpenChange,
}: AddTransactionDialogProps) {
    const t = useTranslations("transactions");
    const tCommon = useTranslations("common");
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
            toast.error(tCommon("error"));
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

            toast.success(tCommon("success"));

            // Reset form
            setName("");
            setAmount("");
            setCategoryId("");
            setDate(new Date().toISOString().split("T")[0]);
            onOpenChange(false);
        } catch (error) {
            toast.error(tCommon("error"));
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent w-fit">{t("addTransaction")}</DialogTitle>
                        <DialogDescription>
                            {t("addTransactionDesc")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-6">
                        {/* Category */}
                        <div className="grid gap-2">
                            <Label htmlFor="category" className="text-sm font-medium text-foreground/80">{t("category")}</Label>
                            <Select
                                value={categoryId}
                                onValueChange={(value) => setCategoryId(value as Id<"categories">)}
                            >
                                <SelectTrigger id="category" className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors">
                                    <SelectValue placeholder={t("selectCategory")} />
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
                            <Label htmlFor="name" className="text-sm font-medium text-foreground/80">{t("description")}</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Courses du mois"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Amount */}
                            <div className="grid gap-2">
                                <Label htmlFor="amount" className="text-sm font-medium text-foreground/80">{t("amount")}</Label>
                                <div className="relative">
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.001"
                                        placeholder="0.000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors pe-12"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm">
                                        TND
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="grid gap-2">
                                <Label htmlFor="date" className="text-sm font-medium text-foreground/80">{t("date")}</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="border-input/50 hover:bg-accent/50"
                        >
                            {tCommon("cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="shadow-lg shadow-primary/20">
                            {isSubmitting ? tCommon("saving") : tCommon("add")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
