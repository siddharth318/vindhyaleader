import { prisma } from "@/lib/prisma";
import type { ArticleStatus } from "@prisma/client";

const PUBLISHED: ArticleStatus = "PUBLISHED";

export const articleListSelect = {
  id: true,
  title: true,
  hindiTitle: true,
  slug: true,
  excerpt: true,
  publishedAt: true,
  isFeatured: true,
  isBreaking: true,
  isTrending: true,
  location: true,
  featuredImage: { select: { url: true, altText: true } },
  category: { select: { name: true, hindiName: true, slug: true } },
  author: { select: { name: true } },
} as const;

export async function getLatestArticles(take = 12, skip = 0) {
  return prisma.article.findMany({
    where: { status: PUBLISHED, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: articleListSelect,
  });
}

export async function getFeaturedArticles(take = 5) {
  return prisma.article.findMany({
    where: { status: PUBLISHED, isFeatured: true, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleListSelect,
  });
}

export async function getBreakingArticles(take = 8) {
  return prisma.article.findMany({
    where: { status: PUBLISHED, isBreaking: true, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleListSelect,
  });
}

export async function getArticlesByCategorySlug(slug: string, take = 12, skip = 0) {
  return prisma.article.findMany({
    where: {
      status: PUBLISHED,
      publishedAt: { lte: new Date() },
      category: { slug },
    },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: articleListSelect,
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      featuredImage: true,
      socialImage: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function getRelatedArticles(categoryId: string, excludeId: string, take = 4) {
  return prisma.article.findMany({
    where: {
      status: PUBLISHED,
      categoryId,
      id: { not: excludeId },
      publishedAt: { lte: new Date() },
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleListSelect,
  });
}

export async function getMostViewedArticles(take = 5) {
  return prisma.article.findMany({
    where: { status: PUBLISHED },
    orderBy: { viewCount: "desc" },
    take,
    select: articleListSelect,
  });
}

export async function searchArticles(query: string, take = 20) {
  if (!query.trim()) return [];
  return prisma.article.findMany({
    where: {
      status: PUBLISHED,
      OR: [
        { title: { contains: query } },
        { hindiTitle: { contains: query } },
        { excerpt: { contains: query } },
        { bodyHtml: { contains: query } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleListSelect,
  });
}

export async function recordArticleView(articleId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.$transaction([
    prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    }),
    prisma.articleView.upsert({
      where: { articleId_date: { articleId, date: today } },
      create: { articleId, date: today, count: 1 },
      update: { count: { increment: 1 } },
    }),
  ]);
}
