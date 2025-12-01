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
    const [isLocked, setIsLocked] = useState(true); // Start locked by default
    const [isInitialized, setIsInitialized] = useState(false);
    const pathname = usePathname();

    // Check if user has a PIN
    const hasPin = !!settings?.pin;

    useEffect(() => {
        if (settings !== undefined && !isInitialized) {
            if (settings?.pin) {
                // Check if already unlocked in this session
                const sessionUnlocked = sessionStorage.getItem('app_unlocked');
                if (sessionUnlocked === 'true') {
                    setIsLocked(false);
                } else {
                    setIsLocked(true);
                }
            } else {
                // No PIN set, don't lock
                setIsLocked(false);
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

    const lock = () => {
        sessionStorage.removeItem('app_unlocked');
        setIsLocked(true);
    };

    const unlock = () => {
        sessionStorage.setItem('app_unlocked', 'true');
        setIsLocked(false);
    };

    // If settings are loading, show nothing until we know if we need to lock
    if (settings === undefined) return null;

    return (
        <SecurityContext.Provider value={{ isLocked, lock, unlock, hasPin }}>
            {children}
            {hasPin && (
                <LockScreen
                    isLocked={isLocked}
                    onUnlock={unlock}
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
