import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Objectifs",
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
