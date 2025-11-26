import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportCSVProps {
    data: any[];
    filename: string;
}

export function ExportCSV({ data, filename }: ExportCSVProps) {
    const handleExport = () => {
        if (!data || data.length === 0) {
            return;
        }

        // Create CSV header
        const headers = ["Date", "Description", "Category", "Amount", "Type"];
        const csvHeader = headers.join(",");

        // Create CSV rows
        const csvRows = data.map((transaction) => {
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
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
        </Button>
    );
}
