import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
      orderBy: { publishedAt: "desc" },
      take: 5000,
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "always", priority: 1 },
    { url: `${siteUrl}/latest`, changeFrequency: "always", priority: 0.9 },
    { url: `${siteUrl}/search`, changeFrequency: "weekly", priority: 0.3 },
    { url: `${siteUrl}/contact-us`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteUrl}/${a.category.slug}/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "hourly",
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
