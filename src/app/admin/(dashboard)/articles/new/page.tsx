import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth";
import { createArticleAction } from "@/lib/actions/article-actions";
import ArticleForm from "@/components/admin/ArticleForm";

export const metadata = { title: "नई खबर जोड़ें" };

export default async function NewArticlePage() {
  const session = await getSession();
  const [categories, media] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">नई खबर जोड़ें</h1>
      <ArticleForm
        action={createArticleAction}
        categories={categories}
        media={media}
        isSuperAdmin={hasRole(session, "SUPER_ADMIN")}
      />
    </div>
  );
}
