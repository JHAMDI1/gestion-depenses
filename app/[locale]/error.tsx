"use client";

import { useEffect } from "react";
import { ErrorUI } from "@/components/shared/ErrorUI";

export default function LocaleError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log locale-specific errors
        console.error("Locale error:", error);
    }, [error]);

    return <ErrorUI error={error} reset={reset} />;
}
