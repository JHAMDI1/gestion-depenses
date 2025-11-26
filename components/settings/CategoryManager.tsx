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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";
import { useTranslations } from "next-intl";

export function CategoryManager() {
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const categories = useQuery(api.categories.getCategories);
    const createCategory = useMutation(api.categories.createCategory);
    const deleteCategory = useMutation(api.categories.deleteCategory);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("📦");
    const [color, setColor] = useState("#7c3aed");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name) {
            toast.error(tCommon("error"));
            return;
        }

        setIsSubmitting(true);

        try {
            await createCategory({
                name,
                icon,
                color,
            });
            toast.success(tCommon("success"));
            setName("");
            setIcon("📦");
            setColor("#7c3aed");
            setIsDialogOpen(false);
        } catch (error) {
            toast.error(tCommon("error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: Id<"categories">) => {
        if (confirm(tCommon("confirmDelete"))) {
            try {
                await deleteCategory({ id });
                toast.success(tCommon("delete") + " " + tCommon("success"));
            } catch (error) {
                toast.error(tCommon("error"));
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t("myCategories")}</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="shadow-md hover:shadow-primary/20">
                            <Plus className="me-2 h-4 w-4" />
                            {t("newCategory")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent w-fit">{t("addCategory")}</DialogTitle>
                                <DialogDescription>
                                    {t("addCategoryDesc")}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-5 py-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-foreground/80">{t("name")}</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Restaurants"
                                        className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="icon" className="text-sm font-medium text-foreground/80">{t("icon")}</Label>
                                        <Input
                                            id="icon"
                                            value={icon}
                                            onChange={(e) => setIcon(e.target.value)}
                                            placeholder="🍔"
                                            className="h-10 border-input/50 bg-background/50 focus:bg-background transition-colors text-center text-lg"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="color" className="text-sm font-medium text-foreground/80">{t("color")}</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="color"
                                                type="color"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="h-10 w-12 p-1 border-input/50 bg-background/50 cursor-pointer"
                                            />
                                            <Input
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="h-10 flex-1 border-input/50 bg-background/50 focus:bg-background transition-colors uppercase"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="shadow-lg shadow-primary/20">
                                    {tCommon("create")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories?.map((category) => (
                    <div
                        key={category._id}
                        className="group flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background hover:shadow-md hover:border-primary/20 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-lg shadow-sm transition-transform duration-300 group-hover:scale-110"
                                style={{ backgroundColor: category.color + "20" }}
                            >
                                {category.icon}
                            </span>
                            <span className="font-medium">{category.name}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            onClick={() => handleDelete(category._id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
