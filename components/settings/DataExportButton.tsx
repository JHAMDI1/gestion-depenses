"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function DataExportButton() {
    const transactions = useQuery(api.transactions.getTransactions, { limit: 5000 });

    const handleExport = () => {
        if (!transactions || transactions.length === 0) {
            return;
        }

        // Create CSV header
        const headers = ["Date", "Description", "Category", "Amount", "Type"];
        const csvHeader = headers.join(",");

        // Create CSV rows
        const csvRows = transactions.map((transaction) => {
            const date = new Date(transaction.date).toLocaleDateString();
            const description = `"${transaction.name?.replace(/"/g, '""') || ''}"`;
            const category = `"${transaction.category?.name?.replace(/"/g, '""') || ''}"`;
            const amount = transaction.amount || 0;
            const type = transaction.type || "EXPENSE";

            return [date, description, category, amount, type].join(",");
        });

        // Combine header and rows
        const csv = [csvHeader, ...csvRows].join("\n");

        // Create blob and download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `masrouf_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
            <div className="space-y-0.5">
                <p className="text-sm font-medium">Export Data</p>
                <p className="text-xs text-muted-foreground">
                    Download all your transactions as CSV
                </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                CSV
            </Button>
        </div>
    );
}
