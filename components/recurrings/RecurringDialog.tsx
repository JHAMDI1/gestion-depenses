"use client";

import { useState, useEffect } from "react";
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
        type?: string;
        frequency?: string;
        dayOfWeek?: number;
        dayOfMonth?: number;
        isActive: boolean;
    } | null;
}

const FREQUENCIES = [
    "DAILY",
    "WEEKLY",
    "BIWEEKLY",
    "MONTHLY",
    "BIMONTHLY",
    "QUARTERLY",
    "SEMIANNUAL",
    "ANNUAL",
    "BIANNUAL",
];

const DAYS_OF_WEEK = [
    { value: 0, label: "Dimanche" },
    { value: 1, label: "Lundi" },
    { value: 2, label: "Mardi" },
    { value: 3, label: "Mercredi" },
    { value: 4, label: "Jeudi" },
    { value: 5, label: "Vendredi" },
    { value: 6, label: "Samedi" },
];

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

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
    const [categoryId, setCategoryId] = useState<string>("");
    const [frequency, setFrequency] = useState("MONTHLY");
    const [dayOfWeek, setDayOfWeek] = useState("1");
    const [dayOfMonth, setDayOfMonth] = useState("1");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (recurringToEdit) {
            setName(recurringToEdit.name);
            setAmount(recurringToEdit.amount.toString());
            setType((recurringToEdit.type as "EXPENSE" | "INCOME") || "EXPENSE");
            setCategoryId(recurringToEdit.categoryId);
            setFrequency(recurringToEdit.frequency || "MONTHLY");
            setDayOfWeek(recurringToEdit.dayOfWeek?.toString() || "1");
            setDayOfMonth(recurringToEdit.dayOfMonth?.toString() || "1");
        } else {
            setName("");
            setAmount("");
            setType("EXPENSE");
            setCategoryId("");
            setFrequency("MONTHLY");
            setDayOfWeek("1");
            setDayOfMonth("1");
        }
    }, [recurringToEdit, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !amount || !categoryId) {
            toast.error(tCommon("error"));
            return;
        }

        setIsSubmitting(true);

        try {
            const recurringData: any = {
                name,
                amount: parseFloat(amount),
                type,
                categoryId: categoryId as Id<"categories">,
                frequency,
            };

            // Add conditional fields based on frequency
            if (frequency === "WEEKLY" || frequency === "BIWEEKLY") {
                recurringData.dayOfWeek = parseInt(dayOfWeek);
            } else {
                recurringData.dayOfMonth = parseInt(dayOfMonth);
            }

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

            onOpenChange(false);
        } catch (error) {
            toast.error(tCommon("error"));
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const showDayOfWeek = frequency === "WEEKLY" || frequency === "BIWEEKLY";
    const showDayOfMonth = !showDayOfWeek;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent w-fit">
                            {recurringToEdit ? t("editRecurring") : t("newRecurring")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("newRecurringDesc")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-6">
                        {/* Type Selector */}
                        <div className="grid gap-2">
                            <Label htmlFor="type" className="text-sm font-medium text-foreground/80">{tCommon("type")}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={type === "EXPENSE" ? "default" : "outline"}
                                    className={type === "EXPENSE" ? "" : "border-border/50"}
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

                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-medium text-foreground/80">{t("name")}</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Netflix, Salaire..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                            />
                        </div>

                        {/* Category */}
                        <div className="grid gap-2">
                            <Label htmlFor="category" className="text-sm font-medium text-foreground/80">{t("category")}</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger id="category" className="h-10 border-input/50 bg-background/50">
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
                            <Label htmlFor="amount" className="text-sm font-medium text-foreground/80">{t("amount")}</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                            />
                        </div>

                        {/* Frequency */}
                        <div className="grid gap-2">
                            <Label htmlFor="frequency" className="text-sm font-medium text-foreground/80">{t("frequency")}</Label>
                            <Select value={frequency} onValueChange={setFrequency}>
                                <SelectTrigger id="frequency" className="h-10 border-input/50 bg-background/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FREQUENCIES.map((freq) => (
                                        <SelectItem key={freq} value={freq}>
                                            {t(`frequencies.${freq}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Day of Week (for WEEKLY/BIWEEKLY) */}
                        {showDayOfWeek && (
                            <div className="grid gap-2">
                                <Label htmlFor="dayOfWeek" className="text-sm font-medium text-foreground/80">{t("dayOfWeek")}</Label>
                                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                                    <SelectTrigger id="dayOfWeek" className="h-10 border-input/50 bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DAYS_OF_WEEK.map((day) => (
                                            <SelectItem key={day.value} value={day.value.toString()}>
                                                {day.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Day of Month (for MONTHLY and others) */}
                        {showDayOfMonth && (
                            <div className="grid gap-2">
                                <Label htmlFor="dayOfMonth" className="text-sm font-medium text-foreground/80">{t("dayOfMonth")}</Label>
                                <Input
                                    id="dayOfMonth"
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={dayOfMonth}
                                    onChange={(e) => setDayOfMonth(e.target.value)}
                                    required
                                    className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
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
                            {isSubmitting ? tCommon("saving") : tCommon("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
