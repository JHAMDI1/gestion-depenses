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
import { EditTransactionDialog } from "@/components/transactions/EditTransactionDialog";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations, useFormatter } from "next-intl";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


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
                        <Button size="lg" className="shadow-lg hover:shadow-primary/25">{tCommon("signIn")}</Button>
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
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const handleEdit = (transaction: any) => {
        setTransactionToEdit(transaction);
        setIsEditDialogOpen(true);
    };

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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t("title")}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t("subtitle")}
                        </p>
                    </div>
                    <Button size="lg" className="gap-2 shadow-lg hover:shadow-primary/25" onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-5 w-5" />
                        {t("addTransaction")}
                    </Button>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full sm:w-72 group">
                                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                                <Input
                                    placeholder={t("searchPlaceholder")}
                                    className="ps-9 bg-background/50 border-border/50 focus:bg-background transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50">
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
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent border-border/50">
                                        <TableHead className="w-[150px] font-semibold">{t("date")}</TableHead>
                                        <TableHead className="font-semibold">{t("description")}</TableHead>
                                        <TableHead className="font-semibold">{t("category")}</TableHead>
                                        <TableHead className="text-end font-semibold">{t("amount")}</TableHead>
                                        <TableHead className="text-end font-semibold">{tCommon("actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!filteredTransactions || filteredTransactions.length === 0 ? (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Search className="h-8 w-8 opacity-20" />
                                                    <p>{t("noTransactions")}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTransactions.map((transaction) => (
                                            <TableRow key={transaction._id} className="group hover:bg-muted/30 border-border/50 transition-colors">
                                                <TableCell className="font-medium text-muted-foreground">
                                                    {format.dateTime(new Date(transaction.date), { dateStyle: 'medium' })}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {transaction.name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-transform duration-200 group-hover:scale-110"
                                                            style={{
                                                                backgroundColor: transaction.category?.color
                                                                    ? `${transaction.category.color}15`
                                                                    : 'var(--color-muted)',
                                                            }}
                                                        >
                                                            {transaction.category?.icon}
                                                        </span>
                                                        <span className="text-sm">{transaction.category?.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-end font-bold text-base">
                                                    {format.number(transaction.amount, { style: 'currency', currency: 'TND' })}
                                                </TableCell>
                                                <TableCell className="text-end">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={() => handleEdit(transaction)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(transaction._id)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
                    </CardContent>
                </Card>
            </div>

            <AddTransactionDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />

            <EditTransactionDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                transaction={transactionToEdit}
            />
        </>
    );
}

