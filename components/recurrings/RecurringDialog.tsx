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
    const t = useTranslations("recurrings");
    const tCommon = useTranslations("common");
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
            toast.error(tCommon("error"));
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
                toast.success(t("recurringUpdated"));
            } else {
                await createRecurring(recurringData);
                toast.success(t("recurringCreated"));
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
                            {recurringToEdit ? t("editRecurring") : t("newRecurring")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("newRecurringDesc")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t("name")}</Label>
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
                            <Label htmlFor="category">{t("category")}</Label>
                            <Select
                                value={categoryId}
                                onValueChange={setCategoryId}
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
                            <Label htmlFor="amount">{t("amount")}</Label>
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
                            <Label htmlFor="day">{t("dayOfMonth")}</Label>
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
