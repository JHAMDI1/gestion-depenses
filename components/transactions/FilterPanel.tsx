import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Id } from "@/convex/_generated/dataModel";

export interface FilterOptions {
    categoryId?: Id<"categories"> | "all";
    type?: "EXPENSE" | "INCOME" | "all";
    minAmount?: number;
    maxAmount?: number;
    startDate?: string;
    endDate?: string;
}

interface FilterPanelProps {
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    categories?: Array<{ _id: Id<"categories">; name: string }>;
}

export function FilterPanel({ filters, onFiltersChange, categories }: FilterPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    const hasActiveFilters =
        (filters.categoryId && filters.categoryId !== "all") ||
        (filters.type && filters.type !== "all") ||
        filters.minAmount !== undefined ||
        filters.maxAmount !== undefined ||
        filters.startDate ||
        filters.endDate;

    const clearFilters = () => {
        onFiltersChange({
            categoryId: "all",
            type: "all",
            minAmount: undefined,
            maxAmount: undefined,
            startDate: undefined,
            endDate: undefined,
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtres
                    {hasActiveFilters && (
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            !
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Filtres avancés</SheetTitle>
                    <SheetDescription>
                        Affinez votre recherche avec plusieurs critères
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    {/* Type Filter */}
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                            value={filters.type || "all"}
                            onValueChange={(value) =>
                                onFiltersChange({ ...filters, type: value as any })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="EXPENSE">Dépenses</SelectItem>
                                <SelectItem value="INCOME">Revenus</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category Filter */}
                    {categories && categories.length > 0 && (
                        <div className="space-y-2">
                            <Label>Catégorie</Label>
                            <Select
                                value={filters.categoryId || "all"}
                                onValueChange={(value) =>
                                    onFiltersChange({ ...filters, categoryId: value as any })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Amount Range */}
                    <div className="space-y-2">
                        <Label>Montant</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="minAmount" className="text-xs text-muted-foreground">
                                    Min
                                </Label>
                                <Input
                                    id="minAmount"
                                    type="number"
                                    placeholder="0"
                                    value={filters.minAmount ?? ""}
                                    onChange={(e) =>
                                        onFiltersChange({
                                            ...filters,
                                            minAmount: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="maxAmount" className="text-xs text-muted-foreground">
                                    Max
                                </Label>
                                <Input
                                    id="maxAmount"
                                    type="number"
                                    placeholder="∞"
                                    value={filters.maxAmount ?? ""}
                                    onChange={(e) =>
                                        onFiltersChange({
                                            ...filters,
                                            maxAmount: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <Label>Période</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                                    Début
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={filters.startDate ?? ""}
                                    onChange={(e) =>
                                        onFiltersChange({ ...filters, startDate: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                                    Fin
                                </Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={filters.endDate ?? ""}
                                    onChange={(e) =>
                                        onFiltersChange({ ...filters, endDate: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Réinitialiser
                        </Button>
                        <Button className="flex-1" onClick={() => setIsOpen(false)}>
                            Appliquer
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
