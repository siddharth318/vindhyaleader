import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const author = await prisma.user.findUnique({ where: { id } });
  if (!author) return {};
  return { title: `${author.name} — लेखक` };
}

export default async function AuthorPage({ params }: Props) {
  const { id } = await params;
  const author = await prisma.user.findUnique({ where: { id } });
  if (!author) notFound();

  const articles = await prisma.article.findMany({
    where: { authorId: id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 24,
    select: {
      slug: true,
      hindiTitle: true,
      excerpt: true,
      publishedAt: true,
      location: true,
      featuredImage: { select: { url: true, altText: true } },
      category: { select: { hindiName: true, slug: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center gap-4 border-b border-neutral-200 pb-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-700 text-2xl font-bold text-white">
          {author.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold">{author.name}</h1>
          {author.bio && <p className="text-sm text-neutral-500">{author.bio}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} size="sm" />
        ))}
      </div>
    </div>
  );
}
