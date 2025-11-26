"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

export function DataSeeder() {
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const resetDefaultCategories = useMutation(api.categories.resetDefaultCategories);
    const locale = useLocale();
    const [isLoading, setIsLoading] = useState(false);

    const handleSeed = async () => {
        setIsLoading(true);
        try {
            await resetDefaultCategories({ locale });
            toast.success(tCommon("success"));
        } catch (error) {
            toast.error(tCommon("error"));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Database className="h-5 w-5" />
                    </div>
                    {t("data")}
                </CardTitle>
                <CardDescription>
                    {t("dataDesc")}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                    <div className="space-y-0.5">
                        <div className="font-medium">{t("defaultCategories")}</div>
                        <p className="text-xs text-muted-foreground">
                            {t("defaultCategoriesDesc")}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleSeed}
                        disabled={isLoading}
                        className="hover:bg-accent/50"
                    >
                        {isLoading ? (
                            <RefreshCw className="me-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="me-2 h-4 w-4" />
                        )}
                        {t("reset")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
