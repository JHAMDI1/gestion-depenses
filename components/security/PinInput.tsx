"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface PinInputProps {
    length?: number;
    onComplete: (pin: string) => void;
    error?: boolean;
    disabled?: boolean;
}

export function PinInput({ length = 4, onComplete, error, disabled }: PinInputProps) {
    const [pin, setPin] = useState<string[]>(new Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0] && !disabled) {
            inputRefs.current[0].focus();
        }
    }, [disabled]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Move to next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check completion
        if (newPin.every((digit) => digit !== "")) {
            onComplete(newPin.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, length);
        if (!/^\d+$/.test(pastedData)) return;

        const newPin = [...pin];
        pastedData.split("").forEach((digit, index) => {
            newPin[index] = digit;
        });
        setPin(newPin);

        if (newPin.every((digit) => digit !== "")) {
            onComplete(newPin.join(""));
        }

        // Focus last filled or first empty
        const nextIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
    };

    return (
        <div className="flex gap-3 justify-center">
            {pin.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className={cn(
                        "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-background transition-all duration-200 outline-none focus:ring-4 focus:ring-primary/20",
                        error
                            ? "border-destructive text-destructive focus:border-destructive focus:ring-destructive/20 animate-shake"
                            : "border-border focus:border-primary text-foreground",
                        disabled && "opacity-50 cursor-not-allowed bg-muted"
                    )}
                />
            ))}
        </div>
    );
}
