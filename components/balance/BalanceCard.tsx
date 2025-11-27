"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import { SetInitialBalanceDialog } from "./SetInitialBalanceDialog";
import { useFormatter } from "next-intl";

export function BalanceCard() {
    const format = useFormatter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const balanceData = useQuery(api.balance.getCurrentBalance, {});

    if (!balanceData) {
        return null;
    }

    const { currentBalance, details } = balanceData;
    const {
        initialAmount,
        totalIncome,
        totalExpenses,
        totalBorrowed,
        totalLent,
        totalSavings,
    } = details;

    return (
        <>
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-lg bg-primary/20 text-primary">
                            <Wallet className="h-5 w-5" />
                        </div>
                        💰 Solde Actuel
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDialogOpen(true)}
                        className="h-8 w-8"
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Solde principal */}
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${currentBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {format.number(currentBalance, { style: 'currency', currency: 'TND' })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Argent disponible
                            </p>
                        </div>

                        {/* Toggle détails */}
                        <Button
                            variant="ghost"
                            className="w-full text-sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? (
                                <>
                                    Masquer les détails <ChevronUp className="ms-2 h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    Voir les détails <ChevronDown className="ms-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        {/* Détails dépliables */}
                        {isExpanded && (
                            <div className="space-y-2 p-4 rounded-lg bg-background/50 border border-border/50">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Solde initial</span>
                                    <span className="font-medium">{format.number(initialAmount, { style: 'currency', currency: 'TND' })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600 dark:text-green-400">+ Revenus</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">{format.number(totalIncome, { style: 'currency', currency: 'TND' })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-600 dark:text-red-400">- Dépenses</span>
                                    <span className="font-medium text-red-600 dark:text-red-400">{format.number(totalExpenses, { style: 'currency', currency: 'TND' })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600 dark:text-green-400">+ Emprunts</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">{format.number(totalBorrowed, { style: 'currency', currency: 'TND' })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-600 dark:text-red-400">- Prêts</span>
                                    <span className="font-medium text-red-600 dark:text-red-400">{format.number(totalLent, { style: 'currency', currency: 'TND' })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-600 dark:text-red-400">- Épargne</span>
                                    <span className="font-medium text-red-600 dark:text-red-400">{format.number(totalSavings, { style: 'currency', currency: 'TND' })}</span>
                                </div>
                                <div className="pt-2 mt-2 border-t border-border/50 flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className={currentBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                        {format.number(currentBalance, { style: 'currency', currency: 'TND' })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <SetInitialBalanceDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                currentAmount={initialAmount}
            />
        </>
    );
}
