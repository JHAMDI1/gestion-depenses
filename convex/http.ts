import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Webhook Clerk pour synchroniser les utilisateurs
http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        // Pour l'instant, on accepte simplement le webhook
        // La synchronisation sera gérée par l'authentification JWT de Clerk
        return new Response(null, { status: 200 });
    }),
});

export default http;
