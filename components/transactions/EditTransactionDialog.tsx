"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Id } from "@/convex/_generated/dataModel";

interface EditTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: {
        _id: Id<"transactions">;
        name: string;
        amount: number;
        categoryId: Id<"categories">;
        date: number;
        type?: string;
    } | null;
}

export function EditTransactionDialog({ open, onOpenChange, transaction }: EditTransactionDialogProps) {
    const t = useTranslations("transactions");
    const tCommon = useTranslations("common");
    const updateTransaction = useMutation(api.transactions.updateTransaction);
    const categories = useQuery(api.categories.getCategories, {});

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState<Id<"categories"> | "">("");
    const [date, setDate] = useState("");
    const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (transaction) {
            setName(transaction.name);
            setAmount(transaction.amount.toString());
            setCategoryId(transaction.categoryId);
            setDate(new Date(transaction.date).toISOString().split("T")[0]);
            setType((transaction.type as "EXPENSE" | "INCOME") || "EXPENSE");
        }
    }, [transaction]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!transaction || !name || !amount || !categoryId || !date) {
            toast.error(tCommon("error"));
            return;
        }

        setIsSubmitting(true);

        try {
            await updateTransaction({
                id: transaction._id,
                name,
                amount: parseFloat(amount),
                categoryId: categoryId as Id<"categories">,
                date: new Date(date).getTime(),
                type,
            });
            toast.success(tCommon("success"));
            onOpenChange(false);
        } catch (error) {
            toast.error(tCommon("error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!transaction) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent w-fit">
                            {tCommon("edit")} {t("addTransaction")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("addTransactionDesc")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="type" className="text-sm font-medium text-foreground/80">{tCommon("type")}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={type === "EXPENSE" ? "default" : "outline"}
                                    className={type === "EXPENSE" ? "bg-red-600 hover:bg-red-700" : "border-border/50"}
                                    onClick={() => setType("EXPENSE")}
                                >
                                    {tCommon("expense")}
                                </Button>
                                <Button
                                    type="button"
                                    variant={type === "INCOME" ? "default" : "outline"}
                                    className={type === "INCOME" ? "bg-green-600 hover:bg-green-700" : "border-border/50"}
                                    onClick={() => setType("INCOME")}
                                >
                                    {tCommon("income")}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-medium text-foreground/80">{t("description")}</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t("descriptionPlaceholder")}
                                className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category" className="text-sm font-medium text-foreground/80">{t("category")}</Label>
                            <Select value={categoryId as string} onValueChange={(val) => setCategoryId(val as Id<"categories">)}>
                                <SelectTrigger className="h-10 border-input/50 bg-background/50">
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

                        <div className="grid gap-2">
                            <Label htmlFor="amount" className="text-sm font-medium text-foreground/80">{t("amount")}</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="date" className="text-sm font-medium text-foreground/80">{t("date")}</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="shadow-lg shadow-primary/20">
                            {tCommon("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
