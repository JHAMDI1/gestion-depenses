import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/navigation';

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/transactions(.*)',
    '/stats(.*)',
    '/budgets(.*)',
    '/goals(.*)',
    '/recurrings(.*)',
    '/settings(.*)',
    '/:locale/dashboard(.*)',
    '/:locale/transactions(.*)',
    '/:locale/stats(.*)',
    '/:locale/budgets(.*)',
    '/:locale/goals(.*)',
    '/:locale/recurrings(.*)',
    '/:locale/settings(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    return intlMiddleware(req);
});

export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
