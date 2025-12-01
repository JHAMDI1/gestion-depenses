"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LockScreen } from "@/components/security/LockScreen";
import { usePathname } from "next/navigation";

interface SecurityContextType {
    isLocked: boolean;
    lock: () => void;
    unlock: () => void;
    hasPin: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
    const settings = useQuery(api.user_settings.getSettings);
    const [isLocked, setIsLocked] = useState(false); // Default false, wait for settings
    const [isInitialized, setIsInitialized] = useState(false);
    const pathname = usePathname();

    // Check if user has a PIN
    const hasPin = !!settings?.pin;

    useEffect(() => {
        if (settings !== undefined && !isInitialized) {
            if (settings?.pin) {
                setIsLocked(true); // Lock immediately if PIN exists
            }
            setIsInitialized(true);
        }
    }, [settings, isInitialized]);

    // Auto-lock on tab switch or inactivity could be added here
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && hasPin) {
                // Optionnel: Verrouiller quand l'app passe en arrière-plan
                // setIsLocked(true); 
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [hasPin]);

    const lock = () => setIsLocked(true);
    const unlock = () => setIsLocked(false);

    // Don't block public pages if any (but here we assume mostly protected)
    // If settings are loading, we might want to show a loader or just render children (risk of flash)
    // Better to show nothing or loader until we know if we need to lock.
    if (settings === undefined) return null; // Or a loading spinner

    return (
        <SecurityContext.Provider value={{ isLocked, lock, unlock, hasPin }}>
            {children}
            {hasPin && (
                <LockScreen
                    isLocked={isLocked}
                    onUnlock={unlock}
                    biometricEnabled={settings.biometricEnabled}
                />
            )}
        </SecurityContext.Provider>
    );
}

export const useSecurity = () => {
    const context = useContext(SecurityContext);
    if (!context) throw new Error("useSecurity must be used within SecurityProvider");
    return context;
};
