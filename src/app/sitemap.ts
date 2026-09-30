import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

const siteUrl = SITE_URL;

// Rebuilt at most hourly — without this the sitemap was generated once at build
// time, so newly published articles never reached it until the next deploy.
// (Fresh articles are also in the Google News sitemap, which is fully dynamic.)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles, authors] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
      orderBy: { publishedAt: "desc" },
      take: 5000,
    }),
    prisma.user.findMany({
      where: { active: true, articles: { some: { status: "PUBLISHED" } } },
      select: { id: true, updatedAt: true },
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "always", priority: 1 },
    { url: `${siteUrl}/latest`, changeFrequency: "always", priority: 0.9 },
    { url: `${siteUrl}/contact-us`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/advertise-with-us`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteUrl}/${a.category.slug}/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const authorEntries: MetadataRoute.Sitemap = authors.map((u) => ({
    url: `${siteUrl}/author/${u.id}`,
    lastModified: u.updatedAt,
    changeFrequency: "weekly",
    priority: 0.3,
  }));

  return [...staticEntries, ...categoryEntries, ...articleEntries, ...authorEntries];
}
