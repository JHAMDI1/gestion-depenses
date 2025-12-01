"use client";

import { useState } from "react";
import { PinInput } from "./PinInput";
import { Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface LockScreenProps {
    isLocked: boolean;
    onUnlock: () => void;
}

export function LockScreen({ isLocked, onUnlock }: LockScreenProps) {
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const verifyPin = useMutation(api.user_settings.verifyPin);

    const handlePinComplete = async (pin: string) => {
        setIsLoading(true);
        setError(false);
        try {
            // Hash du PIN côté client si nécessaire, ici on envoie direct car HTTPS
            const isValid = await verifyPin({ pin });
            if (isValid) {
                onUnlock();
            } else {
                setError(true);
                toast.error("Code PIN incorrect");
                // Reset error animation after delay
                setTimeout(() => setError(false), 500);
            }
        } catch (err) {
            toast.error("Erreur de vérification");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLocked) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
            >
                <div className="w-full max-w-sm space-y-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Lock className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Masrouf Verrouillé</h1>
                        <p className="text-muted-foreground">Entrez votre code PIN pour accéder à vos finances</p>
                    </div>

                    <div className="py-8">
                        <PinInput
                            onComplete={handlePinComplete}
                            error={error}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
