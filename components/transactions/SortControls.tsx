import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortField = "date" | "amount" | "name";
export type SortOrder = "asc" | "desc";

export interface SortConfig {
    field: SortField;
    order: SortOrder;
}

interface SortControlsProps {
    sortConfig: SortConfig;
    onSortChange: (config: SortConfig) => void;
}

export function SortControls({ sortConfig, onSortChange }: SortControlsProps) {
    const getSortIcon = (field: SortField) => {
        if (sortConfig.field !== field) {
            return <ArrowUpDown className="h-4 w-4" />;
        }
        return sortConfig.order === "asc" ? (
            <ArrowUp className="h-4 w-4" />
        ) : (
            <ArrowDown className="h-4 w-4" />
        );
    };

    const handleSort = (field: SortField) => {
        if (sortConfig.field === field) {
            // Toggle order
            onSortChange({
                field,
                order: sortConfig.order === "asc" ? "desc" : "asc",
            });
        } else {
            // New field, default to desc
            onSortChange({ field, order: "desc" });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    {getSortIcon(sortConfig.field)}
                    Trier
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort("date")}>
                    <div className="flex items-center justify-between w-full">
                        <span>Date</span>
                        {sortConfig.field === "date" && getSortIcon("date")}
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("amount")}>
                    <div className="flex items-center justify-between w-full">
                        <span>Montant</span>
                        {sortConfig.field === "amount" && getSortIcon("amount")}
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("name")}>
                    <div className="flex items-center justify-between w-full">
                        <span>Nom</span>
                        {sortConfig.field === "name" && getSortIcon("name")}
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
