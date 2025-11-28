import { Skeleton } from "@/components/ui/skeleton";

export function CategorySkeleton() {
    return (
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3">
            <div className="flex items-center gap-3">
                {/* Icon */}
                <Skeleton className="h-10 w-10 rounded-lg" />

                {/* Name */}
                <Skeleton className="h-4 w-24" />
            </div>

            {/* Action button */}
            <Skeleton className="h-8 w-8 rounded-md" />
        </div>
    );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <CategorySkeleton key={i} />
            ))}
        </div>
    );
}
