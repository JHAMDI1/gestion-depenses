"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstall, setShowInstall] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Check if already dismissed in this session
        if (sessionStorage.getItem('pwa-install-dismissed') === 'true') {
            setIsDismissed(true);
            return;
        }

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowInstall(false);
        }
    };

    const handleDismiss = () => {
        setShowInstall(false);
        setIsDismissed(true);
        sessionStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Don't render anything on server or if dismissed
    if (!isMounted || isDismissed || !showInstall) {
        return null;
    }

    return (
        <Card className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40 border-primary/50 bg-gradient-to-br from-card to-primary/5 shadow-2xl backdrop-blur-xl">
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600 shadow-lg">
                                <Download className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Installer Masrouf</h3>
                                <p className="text-xs text-muted-foreground">Application de finances</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                            Installez l'application pour un accès rapide et une meilleure expérience
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleInstall} className="flex-1">
                                Installer
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleDismiss}>
                                Plus tard
                            </Button>
                        </div>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={handleDismiss}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
