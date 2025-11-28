"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useFormatter } from "next-intl";

interface CategoryData {
    name: string;
    value: number;
    color: string;
    icon?: string;
}

interface TopCategoriesTableProps {
    data: CategoryData[];
    totalExpenses: number;
}

export function TopCategoriesTable({ data, totalExpenses }: TopCategoriesTableProps) {
    const t = useTranslations("stats");
    const tTrans = useTranslations("transactions");
    const format = useFormatter();

    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>{t("categoryDistribution")}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{tTrans("category")}</TableHead>
                                <TableHead className="text-end">{tTrans("amount")}</TableHead>
                                <TableHead className="text-end">{t("percentTotal")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedData.map((item, index) => (
                                <TableRow key={`${item.name}-${index}`}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        {item.name}
                                    </TableCell>
                                    <TableCell className="text-end">
                                        {format.number(item.value, { style: 'currency', currency: 'TND' })}
                                    </TableCell>
                                    <TableCell className="text-end">
                                        {((item.value / totalExpenses) * 100).toFixed(1)}%
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
