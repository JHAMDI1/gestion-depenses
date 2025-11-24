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

interface BudgetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    budgetToEdit?: {
        _id: Id<"budgets">;
        categoryId: Id<"categories">;
        monthlyLimit: number;
    } | null;
}

export function BudgetDialog({
    open,
    onOpenChange,
    budgetToEdit,
}: BudgetDialogProps) {
    const t = useTranslations("budgets");
    const tCommon = useTranslations("common");
    const categories = useQuery(api.categories.getCategories);
    const setBudget = useMutation(api.budgets.setBudget);

    const [categoryId, setCategoryId] = useState<string>(
        budgetToEdit?.categoryId || ""
    );
    const [monthlyLimit, setMonthlyLimit] = useState(
        budgetToEdit?.monthlyLimit.toString() || ""
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryId || !monthlyLimit) {
            toast.error(tCommon("error"));
            return;
        }

        setIsSubmitting(true);

        try {
            await setBudget({
                categoryId: categoryId as Id<"categories">,
                monthlyLimit: parseFloat(monthlyLimit),
            });

            toast.success(
                budgetToEdit ? t("budgetUpdated") : t("budgetDefined")
            );

            // Reset form
            setCategoryId("");
            setMonthlyLimit("");
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
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {budgetToEdit ? t("editBudget") : t("defineBudget")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("defineBudgetDesc")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Category */}
                        <div className="grid gap-2">
                            <Label htmlFor="category">{t("category")}</Label>
                            <Select
                                value={categoryId}
                                onValueChange={setCategoryId}
                                disabled={!!budgetToEdit}
                            >
                                <SelectTrigger id="category">
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

                        {/* Amount */}
                        <div className="grid gap-2">
                            <Label htmlFor="amount">{t("monthlyLimit")}</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.001"
                                placeholder="0.000"
                                value={monthlyLimit}
                                onChange={(e) => setMonthlyLimit(e.target.value)}
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
                            {tCommon("cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? tCommon("saving") : tCommon("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
