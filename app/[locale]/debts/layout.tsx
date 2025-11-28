import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dettes",
};

export default function DebtsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
