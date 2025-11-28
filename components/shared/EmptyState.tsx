import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 backdrop-blur-sm border border-primary/20">
                    <Icon className="h-12 w-12 text-primary/60" />
                </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-2">
                {title}
            </h3>

            <p className="text-muted-foreground max-w-md mb-6">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    size="lg"
                    className="shadow-lg hover:shadow-primary/25"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
