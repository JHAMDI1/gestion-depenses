"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLocaleChange = (newLocale: string) => {
        // Use next-intl navigation to switch locale while preserving the current path
        const locales = ["fr", "ar"] as const;
        let path = pathname;
        for (const l of locales) {
            if (path === `/${l}`) {
                path = "/";
                break;
            }
            if (path.startsWith(`/${l}/`)) {
                path = path.slice(l.length + 1);
                if (path === "") path = "/";
                break;
            }
        }
        router.replace(path, { locale: newLocale });
        router.refresh();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Languages className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Changer la langue</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLocaleChange("fr")}>
                    🇫🇷 Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLocaleChange("ar")}>
                    🇹🇳 العربية
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
