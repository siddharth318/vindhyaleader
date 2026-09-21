import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth";
import { updateArticleAction } from "@/lib/actions/article-actions";
import ArticleForm from "@/components/admin/ArticleForm";

export const metadata = { title: "खबर संपादित करें" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const [article, categories, media] = await Promise.all([
    prisma.article.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  if (!article) notFound();

  const isEditor = hasRole(session, "EDITOR");
  if (!isEditor && article.authorId !== session?.userId) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">खबर संपादित करें</h1>
      <ArticleForm
        action={updateArticleAction.bind(null, article.id)}
        categories={categories}
        media={media}
        isSuperAdmin={hasRole(session, "SUPER_ADMIN")}
        article={{
          title: article.title,
          hindiTitle: article.hindiTitle,
          slug: article.slug,
          excerpt: article.excerpt,
          bodyHtml: article.bodyHtml,
          categoryId: article.categoryId,
          location: article.location,
          featuredImageId: article.featuredImageId,
          imageCaption: article.imageCaption,
          status: article.status,
          isFeatured: article.isFeatured,
          isBreaking: article.isBreaking,
          isTrending: article.isTrending,
          isEditorsPick: article.isEditorsPick,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          seoKeywords: article.seoKeywords,
          canonicalUrl: article.canonicalUrl,
          tags: article.tags.map((t) => t.tag.name).join(", "),
        }}
      />
    </div>
  );
}
