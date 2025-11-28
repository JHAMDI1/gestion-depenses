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
import { useTranslations } from "next-intl";
import { Id } from "@/convex/_generated/dataModel";

interface DebtDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: {
        _id: Id<"debts">;
        personName: string;
        amount: number;
        type: string;
        dueDate?: number;
        description?: string;
    } | null;
}

export function DebtDialog({ open, onOpenChange, initialData }: DebtDialogProps) {
    const t = useTranslations("debts");
    const tCommon = useTranslations("common");
    const createDebt = useMutation(api.debts.createDebt);
    const updateDebt = useMutation(api.debts.updateDebt);

    const [personName, setPersonName] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"LENT" | "BORROWED">("BORROWED");
    const [dueDate, setDueDate] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setPersonName(initialData.personName);
                setAmount(initialData.amount.toString());
                setType(initialData.type as "LENT" | "BORROWED");
                setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "");
                setDescription(initialData.description || "");
            } else {
                setPersonName("");
                setAmount("");
                setType("BORROWED");
                setDueDate("");
                setDescription("");
            }
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!personName || !amount) {
            toast.error(tCommon("error"));
            return;
        }

        setIsSubmitting(true);

        try {
            if (initialData) {
                await updateDebt({
                    id: initialData._id,
                    personName,
                    amount: parseFloat(amount),
                    type,
                    dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
                    description: description || undefined,
                });
                toast.success(tCommon("success"));
            } else {
                await createDebt({
                    personName,
                    amount: parseFloat(amount),
                    type,
                    dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
                    description: description || undefined,
                });
                toast.success(tCommon("success"));
            }

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
                            {initialData ? t("editDebt") : t("addDebt")}
                        </DialogTitle>
                        <DialogDescription>
                            {initialData ? t("addDebtDesc") : t("addDebtDesc")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="type" className="text-sm font-medium text-foreground/80">{tCommon("type")}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={type === "BORROWED" ? "default" : "outline"}
                                    className={type === "BORROWED" ? "bg-red-600 hover:bg-red-700" : "border-border/50"}
                                    onClick={() => setType("BORROWED")}
                                >
                                    {t("borrowed")}
                                </Button>
                                <Button
                                    type="button"
                                    variant={type === "LENT" ? "default" : "outline"}
                                    className={type === "LENT" ? "bg-green-600 hover:bg-green-700" : "border-border/50"}
                                    onClick={() => setType("LENT")}
                                >
                                    {t("lent")}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="personName" className="text-sm font-medium text-foreground/80">{t("personName")}</Label>
                            <Input
                                id="personName"
                                value={personName}
                                onChange={(e) => setPersonName(e.target.value)}
                                placeholder={t("personNamePlaceholder")}
                                className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                            />
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
                            <Label htmlFor="dueDate" className="text-sm font-medium text-foreground/80">{t("dueDate")} ({tCommon("optional")})</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-sm font-medium text-foreground/80">{t("description")} ({tCommon("optional")})</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t("descriptionPlaceholder")}
                                className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="shadow-lg shadow-primary/20">
                            {initialData ? tCommon("save") : tCommon("create")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
