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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function TransactionsPage() {
    const transactions = useQuery(api.transactions.getTransactions, { limit: 100 });
    const categories = useQuery(api.categories.getCategories);
    const deleteTransaction = useMutation(api.transactions.deleteTransaction);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-TN", {
            style: "currency",
            currency: "TND",
            minimumFractionDigits: 3,
        }).format(amount);
    };

    const handleDelete = async (id: Id<"transactions">) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) {
            try {
                await deleteTransaction({ id });
                toast.success("Transaction supprimée");
            } catch (error) {
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    // Filtrage des transactions
    const filteredTransactions = transactions?.filter((transaction) => {
        const matchesSearch = transaction.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === "all" || transaction.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Transactions</h1>
                        <p className="text-muted-foreground">
                            Gérez et suivez toutes vos dépenses
                        </p>
                    </div>
                    <Button size="lg" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-5 w-5" />
                        Ajouter une Dépense
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une transaction..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Toutes les catégories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les catégories</SelectItem>
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

                {/* Transactions Table */}
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!filteredTransactions || filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Aucune transaction trouvée.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction._id}>
                                        <TableCell>
                                            {format(new Date(transaction.date), "dd MMM yyyy", {
                                                locale: fr,
                                            })}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {transaction.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
                                                    style={{
                                                        backgroundColor: transaction.category?.color + "20",
                                                    }}
                                                >
                                                    {transaction.category?.icon}
                                                </span>
                                                <span>{transaction.category?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatCurrency(transaction.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
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

            <AddTransactionDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />
        </AppLayout>
    );
}
