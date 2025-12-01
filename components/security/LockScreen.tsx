"use client";

import { useState, useEffect } from "react";
import { PinInput } from "./PinInput";
import { Lock, Fingerprint, ScanFace } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { startAuthentication } from "@simplewebauthn/browser";

interface LockScreenProps {
    isLocked: boolean;
    onUnlock: () => void;
    biometricEnabled?: boolean;
}

export function LockScreen({ isLocked, onUnlock, biometricEnabled }: LockScreenProps) {
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

    const generateAuthOpts = useAction(api.webauthn.generateAuthOpts);
    const verifyAuth = useAction(api.webauthn.verifyAuth);

    const handleBiometric = async () => {
        try {
            setIsLoading(true);
            const rpId = window.location.hostname;
            const origin = window.location.origin;

            const options = await generateAuthOpts({ rpId });

            // Start authentication on device
            const authResp = await startAuthentication(options);

            // Verify on server
            const verified = await verifyAuth({ response: authResp, rpId, origin });

            if (verified) {
                onUnlock();
                toast.success("Authentification réussie");
            } else {
                toast.error("Échec de l'authentification");
            }
        } catch (err) {
            console.error(err);
            toast.error("Erreur d'authentification biométrique");
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

                    {biometricEnabled && (
                        <button
                            onClick={handleBiometric}
                            className="flex items-center gap-2 mx-auto text-primary hover:text-primary/80 transition-colors"
                        >
                            <Fingerprint className="h-6 w-6" />
                            <span className="font-medium">Utiliser l'empreinte</span>
                        </button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
