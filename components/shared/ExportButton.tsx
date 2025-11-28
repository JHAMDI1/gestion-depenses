"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportTransactionsToPDF, exportStatsToPDF } from "@/lib/pdf-export";
import { toast } from "sonner";

interface ExportButtonProps {
    type: "transactions" | "stats";
    data: any;
    label?: string;
    className?: string;
}

export function ExportButton({ type, data, label, className }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [filename, setFilename] = useState("");

    const getDefaultFilename = () => {
        const date = new Date().toISOString().split('T')[0];
        if (type === "transactions") {
            return `Masrouf_Transactions_${date}`;
        } else {
            return `Masrouf_Stats_${date}`;
        }
    };

    const handleExportClick = () => {
        setFilename(getDefaultFilename());
        setShowDialog(true);
    };

    const handleExport = async () => {
        setIsExporting(true);
        setShowDialog(false);

        try {
            if (type === "transactions") {
                const options = {
                    title: "Rapport des Transactions",
                    subtitle: "Masrouf - Gestion Financière",
                    dateRange: data.dateRange || undefined,
                };

                exportTransactionsToPDF(data.transactions || [], options, filename);
                toast.success("PDF exporté avec succès !");
            } else if (type === "stats") {
                exportStatsToPDF(data, data.month || "", filename);
                toast.success("Statistiques exportées avec succès !");
            }
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Erreur lors de l'export");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="default"
                        disabled={isExporting}
                        className={className}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {isExporting ? "Export en cours..." : label || "Exporter"}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Format d'export</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExportClick}>
                        <FileText className="h-4 w-4 mr-2" />
                        <span>PDF</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Exporter en PDF</DialogTitle>
                        <DialogDescription>
                            Choisissez le nom du fichier PDF à télécharger
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="filename">Nom du fichier</Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="filename"
                                    value={filename}
                                    onChange={(e) => setFilename(e.target.value)}
                                    placeholder={getDefaultFilename()}
                                    className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground">.pdf</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Le fichier sera téléchargé dans votre dossier Téléchargements
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleExport} disabled={!filename.trim()}>
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
