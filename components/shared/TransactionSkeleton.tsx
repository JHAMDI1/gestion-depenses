import { Skeleton } from "@/components/ui/skeleton";

export function TransactionSkeleton() {
    return (
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-4">
            <div className="flex items-center gap-3 flex-1">
                {/* Icon */}
                <Skeleton className="h-10 w-10 rounded-lg" />

                {/* Name and Date */}
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>

            {/* Amount */}
            <Skeleton className="h-5 w-20" />
        </div>
    );
}

export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <TransactionSkeleton key={i} />
            ))}
        </div>
    );
}
