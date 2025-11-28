"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { EditTransactionDialog } from "@/components/transactions/EditTransactionDialog";
import { SearchBar } from "@/components/shared/SearchBar";
import { ExportButton } from "@/components/shared/ExportButton";
import { FilterPanel, FilterOptions } from "@/components/transactions/FilterPanel";
import { SortControls, SortConfig } from "@/components/transactions/SortControls";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations, useFormatter } from "next-intl";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PageTransition from "@/components/shared/PageTransition";
import { motion, AnimatePresence } from "framer-motion";

const MotionTableRow = motion(TableRow);

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

    const transactions = useQuery(api.transactions.getTransactions, { limit: 1000 });
    const categories = useQuery(api.categories.getCategories);
    const deleteTransaction = useMutation(api.transactions.deleteTransaction);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<any>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<Id<"transactions"> | null>(null);

    // Search and Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<FilterOptions>({
        categoryId: "all",
        type: "all",
    });
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: "date",
        order: "desc",
    });

    const handleEdit = (transaction: any) => {
        setTransactionToEdit(transaction);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (id: Id<"transactions">) => {
        setTransactionToDelete(id);
    };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;
        try {
            await deleteTransaction({ id: transactionToDelete });
            toast.success(tCommon("delete") + " " + tCommon("success"));
            setTransactionToDelete(null);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(tCommon("error"));
        }
    };

    // Filter and sort transactions
    const filteredAndSortedTransactions = transactions
        ?.filter((transaction) => {
            // Search by name
            const matchesSearch = transaction.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            // Filter by category
            const matchesCategory =
                !filters.categoryId ||
                filters.categoryId === "all" ||
                transaction.categoryId === filters.categoryId;

            // Filter by type
            const matchesType =
                !filters.type ||
                filters.type === "all" ||
                transaction.type === filters.type;

            // Filter by amount range
            const matchesMinAmount =
                filters.minAmount === undefined ||
                transaction.amount >= filters.minAmount;
            const matchesMaxAmount =
                filters.maxAmount === undefined ||
                transaction.amount <= filters.maxAmount;

            // Filter by date range
            const matchesStartDate =
                !filters.startDate ||
                new Date(transaction.createdAt) >= new Date(filters.startDate);
            const matchesEndDate =
                !filters.endDate ||
                new Date(transaction.createdAt) <= new Date(filters.endDate + "T23:59:59");

            return (
                matchesSearch &&
                matchesCategory &&
                matchesType &&
                matchesMinAmount &&
                matchesMaxAmount &&
                matchesStartDate &&
                matchesEndDate
            );
        })
        .sort((a, b) => {
            const { field, order } = sortConfig;
            let comparison = 0;

            switch (field) {
                case "date":
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case "amount":
                    comparison = a.amount - b.amount;
                    break;
                case "name":
                    comparison = a.name.localeCompare(b.name);
                    break;
            }

            return order === "asc" ? comparison : -comparison;
        });

    const hasActiveFilters = searchTerm ||
        filters.categoryId !== "all" ||
        filters.type !== "all" ||
        filters.minAmount !== undefined ||
        filters.maxAmount !== undefined ||
        filters.startDate ||
        filters.endDate;

    return (
        <>
            <PageTransition className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t("title")}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t("subtitle")}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <ExportButton
                            type="transactions"
                            data={{
                                transactions: filteredAndSortedTransactions || [],
                                dateRange: filters.startDate && filters.endDate
                                    ? `${filters.startDate} - ${filters.endDate}`
                                    : undefined,
                            }}
                            label="Exporter PDF"
                        />
                        <Button size="lg" className="gap-2 shadow-lg hover:shadow-primary/25" onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="h-5 w-5" />
                            {t("addTransaction")}
                        </Button>
                    </div>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder={t("searchPlaceholder")}
                            />
                            <div className="flex gap-2">
                                <FilterPanel
                                    filters={filters}
                                    onFiltersChange={setFilters}
                                    categories={categories}
                                />
                                <SortControls
                                    sortConfig={sortConfig}
                                    onSortChange={setSortConfig}
                                />
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
                                    <AnimatePresence mode="popLayout">
                                        {!filteredAndSortedTransactions || filteredAndSortedTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? "Aucune transaction trouvée avec ces filtres"
                                                        : t("noTransactions")}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAndSortedTransactions.map((transaction) => (
                                                <MotionTableRow
                                                    key={transaction._id}
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="group hover:bg-muted/30 border-border/50 transition-colors"
                                                >
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
                                                        <span className={transaction.type === "INCOME" ? "text-green-600" : ""}>
                                                            {transaction.type === "INCOME" ? "+" : ""}
                                                            {format.number(transaction.amount, { style: 'currency', currency: 'TND' })}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-end">
                                                        <div className="flex justify-end gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEdit(transaction);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(transaction._id);
                                                                }}
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </MotionTableRow>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </PageTransition>

            <AddTransactionDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />

            <EditTransactionDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                transaction={transactionToEdit}
            />

            <Dialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{tCommon("confirmDelete")}</DialogTitle>
                        <DialogDescription>{tCommon("deleteDescription")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTransactionToDelete(null)}>{tCommon("cancel")}</Button>
                        <Button variant="destructive" onClick={confirmDelete}>{tCommon("delete")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
