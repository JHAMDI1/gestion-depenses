import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Tableau de Bord</h1>
            <p className="text-muted-foreground">
                Bienvenue sur Masrouf ! Le dashboard sera bientôt disponible.
            </p>
        </div>
    );
}
