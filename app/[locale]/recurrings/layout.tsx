import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dépenses Récurrentes",
};

export default function RecurringsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
