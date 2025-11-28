import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ChartSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
                <div className="h-[300px] flex items-end justify-around gap-2 px-4">
                    {/* Simulated bar chart */}
                    {Array.from({ length: 6 }).map((_, i) => {
                        const heights = [60, 80, 45, 90, 70, 55];
                        return (
                            <Skeleton
                                key={i}
                                className="w-full rounded-t-lg"
                                style={{ height: `${heights[i]}%` }}
                            />
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

export function PieChartSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-48 w-48 rounded-full" />
                </div>
            </CardContent>
        </Card>
    );
}

export function StatsCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-28 mb-1" />
                <Skeleton className="h-3 w-36" />
            </CardContent>
        </Card>
    );
}
