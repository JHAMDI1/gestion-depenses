import { v } from "convex/values";
import { mutation, action, internalQuery, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { internal } from "./_generated/api";

const RP_NAME = "Masrouf";

// 1. Generate Registration Options
export const generateRegistrationOpts = action({
    args: {
        rpId: v.string(),
        origin: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Get user's existing credentials to exclude them
        const userCredentials = await ctx.runQuery(internal.webauthn.getUserCredentials, { userId });

        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: args.rpId,
            userID: userId,
            userName: "User", // Could fetch email/name
            attestationType: "none",
            excludeCredentials: userCredentials.map((cred) => ({
                id: new Uint8Array(Buffer.from(cred.credentialId, "base64")),
                type: "public-key",
                transports: cred.transports as any,
            })),
            authenticatorSelection: {
                residentKey: "preferred",
                userVerification: "preferred",
                authenticatorAttachment: "platform", // Force TouchID/FaceID
            },
        });

        // Store challenge and rpId for verification
        await ctx.runMutation(internal.webauthn.saveChallenge, {
            userId,
            challenge: options.challenge,
        });

        return options;
    },
});

// 2. Verify Registration
export const verifyRegistration = action({
    args: {
        response: v.any(),
        rpId: v.string(),
        origin: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const challenge = await ctx.runQuery(internal.webauthn.getChallenge, { userId });
        if (!challenge) throw new Error("No challenge found");

        const verification = await verifyRegistrationResponse({
            response: args.response,
            expectedChallenge: challenge,
            expectedOrigin: args.origin,
            expectedRPID: args.rpId,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

            // Save credential
            await ctx.runMutation(internal.webauthn.saveCredential, {
                userId,
                credentialId: Buffer.from(credentialID).toString("base64"),
                publicKey: Buffer.from(credentialPublicKey).toString("base64"),
                counter,
                transports: args.response.response.transports,
            });

            return true;
        }
        return false;
    },
});

// 3. Generate Authentication Options
export const generateAuthOpts = action({
    args: {
        rpId: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const userCredentials = await ctx.runQuery(internal.webauthn.getUserCredentials, { userId });

        const options = await generateAuthenticationOptions({
            rpID: args.rpId,
            allowCredentials: userCredentials.map((cred) => ({
                id: new Uint8Array(Buffer.from(cred.credentialId, "base64")),
                type: "public-key",
                transports: cred.transports as any,
            })),
            userVerification: "preferred",
        });

        await ctx.runMutation(internal.webauthn.saveChallenge, { userId, challenge: options.challenge });

        return options;
    },
});

// 4. Verify Authentication
export const verifyAuth = action({
    args: {
        response: v.any(),
        rpId: v.string(),
        origin: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const challenge = await ctx.runQuery(internal.webauthn.getChallenge, { userId });
        if (!challenge) throw new Error("No challenge found");

        const credential = await ctx.runQuery(internal.webauthn.getCredential, { credentialId: args.response.id });
        if (!credential) throw new Error("Credential not found");

        const verification = await verifyAuthenticationResponse({
            response: args.response,
            expectedChallenge: challenge,
            expectedOrigin: args.origin,
            expectedRPID: args.rpId,
            authenticator: {
                credentialID: new Uint8Array(Buffer.from(credential.credentialId, "base64")),
                credentialPublicKey: new Uint8Array(Buffer.from(credential.publicKey, "base64")),
                counter: credential.counter,
            },
        });

        if (verification.verified) {
            const { newCounter } = verification.authenticationInfo;
            await ctx.runMutation(internal.webauthn.updateCounter, {
                credentialId: credential.credentialId,
                counter: newCounter,
            });
            return true;
        }
        return false;
    },
});

// Internal Helpers (Mutations/Queries)
export const getUserCredentials = internalQuery({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("biometric_credentials")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

export const getCredential = internalQuery({
    args: { credentialId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("biometric_credentials")
            .withIndex("by_credential_id", (q) => q.eq("credentialId", args.credentialId))
            .unique();
    },
});

export const saveChallenge = internalMutation({
    args: { userId: v.string(), challenge: v.string() },
    handler: async (ctx, args) => {
        const settings = await ctx.db
            .query("user_settings")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();

        if (settings) {
            await ctx.db.patch(settings._id, { currentChallenge: args.challenge });
        }
    },
});

export const getChallenge = internalQuery({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const settings = await ctx.db
            .query("user_settings")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();
        return settings?.currentChallenge;
    },
});

export const saveCredential = internalMutation({
    args: {
        userId: v.string(),
        credentialId: v.string(),
        publicKey: v.string(),
        counter: v.number(),
        transports: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("biometric_credentials", {
            userId: args.userId,
            credentialId: args.credentialId,
            publicKey: args.publicKey,
            counter: args.counter,
            transports: args.transports,
            createdAt: Date.now(),
            lastUsedAt: Date.now(),
        });

        // Also enable biometric in settings
        const settings = await ctx.db
            .query("user_settings")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();
        if (settings) {
            await ctx.db.patch(settings._id, { biometricEnabled: true });
        }
    },
});

export const updateCounter = internalMutation({
    args: { credentialId: v.string(), counter: v.number() },
    handler: async (ctx, args) => {
        const cred = await ctx.db
            .query("biometric_credentials")
            .withIndex("by_credential_id", (q) => q.eq("credentialId", args.credentialId))
            .unique();
        if (cred) {
            await ctx.db.patch(cred._id, {
                counter: args.counter,
                lastUsedAt: Date.now(),
            });
        }
    },
});
