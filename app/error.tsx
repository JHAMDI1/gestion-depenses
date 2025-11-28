"use client";

import { useEffect } from "react";
import { ErrorUI } from "@/components/shared/ErrorUI";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to error reporting service (Sentry, etc.)
        console.error("Global error:", error);
    }, [error]);

    return <ErrorUI error={error} reset={reset} />;
}
