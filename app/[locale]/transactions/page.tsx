"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Trash2, Edit } from "lucide-react";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations, useFormatter } from "next-intl";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function TransactionsPage() {
    const tCommon = useTranslations("common");
    return (
        <AppLayout>
            <SignedIn>
                <TransactionsContent />
            </SignedIn>
            <SignedOut>
                <div className="flex min-h-[50vh] items-center justify-center">
                    <SignInButton mode="modal">
                        <Button size="lg">{tCommon("signIn")}</Button>
                    </SignInButton>
                </div>
            </SignedOut>
        </AppLayout>
    );
}

function TransactionsContent() {
    const t = useTranslations("transactions");
    const tCommon = useTranslations("common");
    const format = useFormatter();

    const transactions = useQuery(api.transactions.getTransactions, { limit: 100 });
    const categories = useQuery(api.categories.getCategories);
    const deleteTransaction = useMutation(api.transactions.deleteTransaction);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const handleDelete = async (id: Id<"transactions">) => {
        if (confirm(tCommon("confirmDelete"))) {
            try {
                await deleteTransaction({ id });
                toast.success(tCommon("delete") + " " + tCommon("success"));
            } catch (error) {
                toast.error(tCommon("error"));
            }
        }
    };

    const filteredTransactions = transactions?.filter((transaction) => {
        const matchesSearch = transaction.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === "all" || transaction.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{t("title")}</h1>
                        <p className="text-muted-foreground">
                            {t("subtitle")}
                        </p>
                    </div>
                    <Button size="lg" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-5 w-5" />
                        {t("addTransaction")}
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("searchPlaceholder")}
                            className="ps-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder={t("allCategories")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("allCategories")}</SelectItem>
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
                </div>

                <div className="rounded-md border bg-card">
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("date")}</TableHead>
                                <TableHead>{t("description")}</TableHead>
                                <TableHead>{t("category")}</TableHead>
                                <TableHead className="text-end">{t("amount")}</TableHead>
                                <TableHead className="text-end">{tCommon("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!filteredTransactions || filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        {t("noTransactions")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction._id}>
                                        <TableCell>
                                            {format.dateTime(new Date(transaction.date), { dateStyle: 'medium' })}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {transaction.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors duration-200 ease-out"
                                                    style={{
                                                        backgroundColor: transaction.category?.color
                                                            ? `${transaction.category.color}20`
                                                            : 'var(--color-muted)',
                                                    }}
                                                >
                                                    {transaction.category?.icon}
                                                </span>
                                                <span>{transaction.category?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-end font-bold">
                                            {format.number(transaction.amount, { style: 'currency', currency: 'TND' })}
                                        </TableCell>
                                        <TableCell className="text-end">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" disabled>
                                                    <Edit className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(transaction._id)}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </div>
            </div>

            <AddTransactionDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />
        </>
    );
}
