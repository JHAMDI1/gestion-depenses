import { Auth } from "convex/server";
import { Id } from "./_generated/dataModel";

export const auth: Auth = {
    getUserIdentity: async (ctx) => {
        return await ctx.auth.getUserIdentity();
    },
};
