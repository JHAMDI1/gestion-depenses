import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/fr',
    '/ar',
    '/fr/dashboard',
    '/ar/dashboard',
    '/fr/transactions',
    '/ar/transactions',
    '/fr/budgets',
    '/ar/budgets',
    '/fr/stats',
    '/ar/stats',
    '/fr/goals',
    '/ar/goals',
    '/fr/recurrings',
    '/ar/recurrings',
    '/fr/settings',
    '/ar/settings',
  ];
  const now = new Date();
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.7,
  }));
}
