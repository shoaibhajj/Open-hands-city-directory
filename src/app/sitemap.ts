import { MetadataRoute } from 'next';
import prisma from '@/lib/db';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/ar/directory`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/ar/search`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/ar/auth/signin`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/ar/auth/signup`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  // Dynamic business pages
  try {
    const businesses = await prisma.businessProfile.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, updatedAt: true },
      take: 1000,
    });

    const businessPages = businesses.map((business) => ({
      url: `${baseUrl}/ar/business/${business.id}`,
      lastModified: business.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Dynamic category pages
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/ar/directory?category=${category.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...businessPages, ...categoryPages];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return staticPages;
  }
}