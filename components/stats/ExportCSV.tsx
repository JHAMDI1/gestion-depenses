"use client";

import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/export";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface ExportCSVProps {
    data: any[];
    filename?: string;
}

export function ExportCSV({ data, filename = "transactions.csv" }: ExportCSVProps) {
    const t = useTranslations("stats");
    const tCommon = useTranslations("common");
    const tTrans = useTranslations("transactions");

    const handleExport = () => {
        // Format data for export
        const formattedData = data.map(item => ({
            [tTrans("date")]: format(new Date(item.date), "dd/MM/yyyy HH:mm"),
            [tTrans("description")]: item.name,
            [tTrans("amount")]: item.amount,
            [tTrans("category")]: item.category?.name || tCommon("uncategorized"),
            [tCommon("type")]: tCommon("expense")
        }));

        downloadCSV(formattedData, filename);
    };

    return (
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            {t("exportCSV")}
        </Button>
    );
}
