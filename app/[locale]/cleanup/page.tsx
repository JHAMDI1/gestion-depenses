"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CleanupPage() {
    const cleanup = useMutation(api.user_settings.cleanupDeprecatedFields);

    const handleCleanup = async () => {
        try {
            await cleanup({});
            toast.success("Nettoyage effectué avec succès !");
        } catch (err) {
            toast.error("Erreur lors du nettoyage");
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Nettoyage de la base de données</h1>
                <p className="text-muted-foreground">Cliquez pour supprimer les anciens champs</p>
                <Button onClick={handleCleanup} size="lg">
                    Nettoyer maintenant
                </Button>
            </div>
        </div>
    );
}
