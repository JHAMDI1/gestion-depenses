"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PinInput } from "@/components/security/PinInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, KeyRound } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function SecuritySettings() {
    const settings = useQuery(api.user_settings.getSettings);
    const setPin = useMutation(api.user_settings.setPin);

    const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [step, setStep] = useState<"enter" | "confirm">("enter");

    const handleSetPin = async () => {
        if (newPin !== confirmPin) {
            toast.error("Les codes PIN ne correspondent pas");
            setStep("enter");
            setNewPin("");
            setConfirmPin("");
            return;
        }

        try {
            await setPin({ pin: newPin });
            toast.success("Code PIN défini avec succès");
            setIsPinDialogOpen(false);
            setNewPin("");
            setConfirmPin("");
            setStep("enter");
        } catch (err) {
            toast.error("Erreur lors de la définition du PIN");
        }
    };

    if (settings === undefined) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Sécurité</h2>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-6">
                {/* PIN Configuration */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-base">Code PIN</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {settings?.pin
                                ? "Un code PIN est défini pour sécuriser l'accès."
                                : "Définissez un code PIN pour protéger vos données."}
                        </p>
                    </div>
                    <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant={settings?.pin ? "outline" : "default"}>
                                {settings?.pin ? "Modifier le PIN" : "Configurer"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {step === "enter" ? "Définir un nouveau code PIN" : "Confirmer le code PIN"}
                                </DialogTitle>
                                <DialogDescription>
                                    {step === "enter"
                                        ? "Entrez un code à 4 chiffres."
                                        : "Entrez le code à nouveau pour confirmer."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6 flex justify-center">
                                <PinInput
                                    key={step} // Reset input on step change
                                    onComplete={(val) => {
                                        if (step === "enter") {
                                            setNewPin(val);
                                            setStep("confirm");
                                        } else {
                                            setConfirmPin(val);
                                            // Trigger save automatically after small delay or wait for button?
                                            // Let's wait for button click or effect.
                                            // Actually better to just set state and let user click "Save" or auto-save?
                                            // Let's auto-save in useEffect or direct call here?
                                            // Direct call here is tricky because state update is async.
                                            // We'll just store it and show a "Save" button or auto-trigger.
                                        }
                                    }}
                                />
                            </div>
                            {step === "confirm" && confirmPin.length === 4 && (
                                <Button onClick={handleSetPin} className="w-full">
                                    Confirmer et Sauvegarder
                                </Button>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
