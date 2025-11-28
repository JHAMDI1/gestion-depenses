"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorUIProps {
    error: Error & { digest?: string };
    reset?: () => void;
    showHomeButton?: boolean;
}

export function ErrorUI({ error, reset, showHomeButton = true }: ErrorUIProps) {
    const router = useRouter();

    useEffect(() => {
        // Log error to console in development
        console.error("Error caught by boundary:", error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] items-center justify-center p-4">
            <Card className="w-full max-w-lg border-destructive/50 bg-destructive/5">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Une erreur est survenue</CardTitle>
                    <CardDescription>
                        Nous sommes désolés, quelque chose s'est mal passé.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {process.env.NODE_ENV === "development" && (
                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm font-mono text-muted-foreground">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Error ID: {error.digest}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row">
                        {reset && (
                            <Button
                                onClick={reset}
                                variant="default"
                                className="flex-1"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Réessayer
                            </Button>
                        )}
                        {showHomeButton && (
                            <Button
                                onClick={() => router.push("/")}
                                variant="outline"
                                className="flex-1"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                Retour accueil
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
