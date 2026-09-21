"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth";
import { slugify, uniqueSuffix } from "@/lib/slug";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import type { ArticleStatus } from "@prisma/client";

async function requireReporter() {
  const session = await getSession();
  if (!hasRole(session, "REPORTER")) redirect("/admin/login");
  return session!;
}

async function requireEditor() {
  const session = await getSession();
  if (!hasRole(session, "EDITOR")) redirect("/admin/login");
  return session!;
}

async function requireSuperAdmin() {
  const session = await getSession();
  if (!hasRole(session, "SUPER_ADMIN")) redirect("/admin/login");
  return session!;
}

/** Non-super-admins can only ever save a Draft or submit for review — only the Super Admin can make something go live. */
function resolveStatusForRole(requested: ArticleStatus, isSuperAdmin: boolean): ArticleStatus {
  if (isSuperAdmin) return requested;
  return requested === "DRAFT" ? "DRAFT" : "PENDING_REVIEW";
}

async function ensureUniqueSlug(base: string, ignoreId?: string) {
  let slug = base || `article-${uniqueSuffix()}`;
  for (let i = 0; i < 5; i++) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${uniqueSuffix()}`;
  }
  return `${base}-${uniqueSuffix()}`;
}

function revalidateArticleSurfaces(categorySlug: string, slug: string) {
  revalidatePath("/");
  revalidatePath(`/${categorySlug}`);
  revalidatePath(`/${categorySlug}/${slug}`);
  revalidatePath("/sitemap.xml");
}

async function syncArticleTags(articleId: string, tagsCsv: string) {
  const names = Array.from(
    new Set(
      tagsCsv
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );

  await prisma.articleTag.deleteMany({ where: { articleId } });
  if (names.length === 0) return;

  for (const name of names) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
    await prisma.articleTag.create({ data: { articleId, tagId: tag.id } });
  }
}

export async function createArticleAction(formData: FormData) {
  const session = await requireReporter();

  const title = String(formData.get("title") ?? "").trim();
  const hindiTitle = String(formData.get("hindiTitle") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const status = String(formData.get("status") ?? "DRAFT") as ArticleStatus;
  const bodyHtml = sanitizeArticleHtml(String(formData.get("bodyHtml") ?? ""));
  const requestedSlug = slugify(String(formData.get("slug") ?? "") || title || hindiTitle);

  if (!hindiTitle || !categoryId) {
    throw new Error("शीर्षक और श्रेणी आवश्यक हैं।");
  }

  // Only the Super Admin can publish/schedule directly; everyone else's work goes to review.
  const isSuperAdmin = hasRole(session, "SUPER_ADMIN");
  const finalStatus = resolveStatusForRole(status, isSuperAdmin);
  const slug = await ensureUniqueSlug(requestedSlug);

  const article = await prisma.article.create({
    data: {
      title: title || hindiTitle,
      hindiTitle,
      slug,
      excerpt: String(formData.get("excerpt") ?? "") || null,
      bodyHtml,
      categoryId,
      authorId: session.userId,
      location: String(formData.get("location") ?? "") || null,
      featuredImageId: String(formData.get("featuredImageId") ?? "") || null,
      imageCaption: String(formData.get("imageCaption") ?? "") || null,
      status: finalStatus,
      publishedAt: finalStatus === "PUBLISHED" ? new Date() : null,
      isFeatured: formData.get("isFeatured") === "on",
      isBreaking: formData.get("isBreaking") === "on",
      isTrending: formData.get("isTrending") === "on",
      isEditorsPick: formData.get("isEditorsPick") === "on",
      seoTitle: String(formData.get("seoTitle") ?? "") || null,
      seoDescription: String(formData.get("seoDescription") ?? "") || null,
      seoKeywords: String(formData.get("seoKeywords") ?? "") || null,
      canonicalUrl: String(formData.get("canonicalUrl") ?? "") || null,
    },
    include: { category: true },
  });

  await syncArticleTags(article.id, String(formData.get("tags") ?? ""));

  await prisma.auditLog.create({
    data: { userId: session.userId, action: "CREATE", entityType: "Article", entityId: article.id },
  });

  revalidateArticleSurfaces(article.category.slug, article.slug);
  redirect("/admin/articles");
}

export async function updateArticleAction(articleId: string, formData: FormData) {
  const session = await requireReporter();
  const existing = await prisma.article.findUnique({ where: { id: articleId }, include: { category: true } });
  if (!existing) throw new Error("खबर नहीं मिली।");

  const isEditor = hasRole(session, "EDITOR");
  const isOwner = existing.authorId === session.userId;
  if (!isEditor && !isOwner) redirect("/admin/articles");

  const hindiTitle = String(formData.get("hindiTitle") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || hindiTitle;
  const categoryId = String(formData.get("categoryId") ?? "");
  const requestedStatus = String(formData.get("status") ?? existing.status) as ArticleStatus;
  const bodyHtml = sanitizeArticleHtml(String(formData.get("bodyHtml") ?? ""));
  const requestedSlug = slugify(String(formData.get("slug") ?? "") || existing.slug);
  const slug = requestedSlug === existing.slug ? existing.slug : await ensureUniqueSlug(requestedSlug, existing.id);

  // Only the Super Admin can publish directly; anyone else's edits (including to an
  // already-published article) go back to review before they go live again.
  const isSuperAdmin = hasRole(session, "SUPER_ADMIN");
  const finalStatus = resolveStatusForRole(requestedStatus, isSuperAdmin);
  const wasPublished = existing.status === "PUBLISHED";
  const willBePublished = finalStatus === "PUBLISHED";

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new Error("अमान्य श्रेणी।");

  const updated = await prisma.article.update({
    where: { id: articleId },
    data: {
      title,
      hindiTitle,
      slug,
      excerpt: String(formData.get("excerpt") ?? "") || null,
      bodyHtml,
      categoryId,
      location: String(formData.get("location") ?? "") || null,
      featuredImageId: String(formData.get("featuredImageId") ?? "") || null,
      imageCaption: String(formData.get("imageCaption") ?? "") || null,
      status: finalStatus,
      publishedAt: !wasPublished && willBePublished ? new Date() : existing.publishedAt,
      isFeatured: formData.get("isFeatured") === "on",
      isBreaking: formData.get("isBreaking") === "on",
      isTrending: formData.get("isTrending") === "on",
      isEditorsPick: formData.get("isEditorsPick") === "on",
      seoTitle: String(formData.get("seoTitle") ?? "") || null,
      seoDescription: String(formData.get("seoDescription") ?? "") || null,
      seoKeywords: String(formData.get("seoKeywords") ?? "") || null,
      canonicalUrl: String(formData.get("canonicalUrl") ?? "") || null,
    },
    include: { category: true },
  });

  await syncArticleTags(articleId, String(formData.get("tags") ?? ""));

  await prisma.auditLog.create({
    data: { userId: session.userId, action: "UPDATE", entityType: "Article", entityId: articleId },
  });

  revalidateArticleSurfaces(existing.category.slug, existing.slug);
  revalidateArticleSurfaces(updated.category.slug, updated.slug);
  redirect("/admin/articles");
}

export async function deleteArticleAction(articleId: string) {
  const session = await requireEditor();
  const existing = await prisma.article.findUnique({ where: { id: articleId }, include: { category: true } });
  if (!existing) return;

  await prisma.article.delete({ where: { id: articleId } });
  await prisma.auditLog.create({
    data: { userId: session.userId, action: "DELETE", entityType: "Article", entityId: articleId },
  });
  revalidateArticleSurfaces(existing.category.slug, existing.slug);
  revalidatePath("/admin/articles");
}

export async function toggleArticleStatusAction(articleId: string, status: ArticleStatus) {
  const session = await requireEditor();
  // Publishing (going live) is a Super Admin-only action; editors may still take content down.
  if (status === "PUBLISHED" && !hasRole(session, "SUPER_ADMIN")) redirect("/admin/articles");

  const existing = await prisma.article.findUnique({ where: { id: articleId }, include: { category: true } });
  if (!existing) return;

  await prisma.article.update({
    where: { id: articleId },
    data: {
      status,
      publishedAt: status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  });
  await prisma.auditLog.create({
    data: { userId: session.userId, action: `STATUS_${status}`, entityType: "Article", entityId: articleId },
  });
  revalidateArticleSurfaces(existing.category.slug, existing.slug);
  revalidatePath("/admin/articles");
}

/** Super Admin approves a pending submission — it goes live immediately. */
export async function approveArticleAction(articleId: string) {
  const session = await requireSuperAdmin();
  const existing = await prisma.article.findUnique({ where: { id: articleId }, include: { category: true } });
  if (!existing) return;

  await prisma.article.update({
    where: { id: articleId },
    data: { status: "PUBLISHED", publishedAt: existing.publishedAt ?? new Date() },
  });
  await prisma.auditLog.create({
    data: { userId: session.userId, action: "APPROVE", entityType: "Article", entityId: articleId },
  });
  revalidateArticleSurfaces(existing.category.slug, existing.slug);
  revalidatePath("/admin/articles");
}

/** Super Admin sends a pending submission back to Draft for revisions. */
export async function rejectArticleAction(articleId: string) {
  const session = await requireSuperAdmin();
  const existing = await prisma.article.findUnique({ where: { id: articleId }, include: { category: true } });
  if (!existing) return;

  await prisma.article.update({ where: { id: articleId }, data: { status: "DRAFT" } });
  await prisma.auditLog.create({
    data: { userId: session.userId, action: "REJECT", entityType: "Article", entityId: articleId },
  });
  revalidateArticleSurfaces(existing.category.slug, existing.slug);
  revalidatePath("/admin/articles");
}
