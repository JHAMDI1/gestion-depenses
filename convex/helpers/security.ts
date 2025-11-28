import { ConvexError } from "convex/values";
import { ZodSchema } from "zod";
import { MutationCtx } from "../_generated/server";

/**
 * Validate data against a Zod schema
 * Throws ConvexError with clear message if validation fails
 */
export function validateWithZod<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);

    if (!result.success) {
        // Utiliser .issues au lieu de .errors pour éviter les problèmes de typage
        const errors = result.error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
        }));

        const errorMessage = errors
            .map((e: { field: string; message: string }) => `${e.field}: ${e.message}`)
            .join(', ');

        throw new ConvexError({
            code: 'VALIDATION_ERROR',
            message: `Validation échouée: ${errorMessage}`,
            errors, // On passe l'objet errors simplifié
        });
    }

    return result.data;
}

/**
 * Rate limiting tracker using Convex database
 * Tracks requests per user/IP per time window
 */
interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
    // Mutations critiques - 10 requêtes par minute
    'createTransaction': { maxRequests: 10, windowMs: 60000 },
    'updateTransaction': { maxRequests: 10, windowMs: 60000 },
    'deleteTransaction': { maxRequests: 10, windowMs: 60000 },

    // Mutations modérées - 20 requêtes par minute
    'createCategory': { maxRequests: 20, windowMs: 60000 },
    'createBudget': { maxRequests: 20, windowMs: 60000 },

    // Queries - 100 requêtes par minute (si implémenté côté client ou via action)
    'getTransactions': { maxRequests: 100, windowMs: 60000 },
};

/**
 * Check if request should be rate limited
 * Returns true if request is allowed, throws ConvexError if rate limit exceeded
 * MUST be called from a mutation
 */
export async function checkRateLimit(
    ctx: MutationCtx,
    action: string,
    identifier: string // userId or IP
): Promise<boolean> {
    const config = RATE_LIMITS[action];

    if (!config) {
        // No rate limit configured for this action
        return true;
    }

    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean up old rate limits for this user/action (optional optimization)
    // In a real app, you might have a cron job for cleanup

    // Check current rate limit
    const rateLimit = await ctx.db
        .query("rate_limits")
        .withIndex("by_identifier_action", (q) =>
            q.eq("identifier", identifier).eq("action", action)
        )
        .first();

    if (rateLimit) {
        if (rateLimit.windowStart < windowStart) {
            // Window expired, reset
            await ctx.db.patch(rateLimit._id, {
                count: 1,
                windowStart: now,
            });
        } else {
            // Window active, check count
            if (rateLimit.count >= config.maxRequests) {
                throw new ConvexError({
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: `Trop de requêtes. Veuillez réessayer dans quelques instants.`,
                });
            }

            // Increment count
            await ctx.db.patch(rateLimit._id, {
                count: rateLimit.count + 1,
            });
        }
    } else {
        // Create new rate limit record
        await ctx.db.insert("rate_limits", {
            identifier,
            action,
            count: 1,
            windowStart: now,
        });
    }

    return true;
}

/**
 * Log critical actions for audit trail
 */
export interface AuditLogEntry {
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details?: any;
    timestamp?: number;
    ipAddress?: string;
}

export async function logAudit(ctx: MutationCtx, entry: AuditLogEntry) {
    await ctx.db.insert("audit_logs", {
        userId: entry.userId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        details: entry.details,
        ipAddress: entry.ipAddress,
        timestamp: entry.timestamp || Date.now(),
    });
}
