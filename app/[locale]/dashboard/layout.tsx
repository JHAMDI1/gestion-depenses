import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tableau de Bord",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
