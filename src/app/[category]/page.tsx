import { notFound } from "next/navigation";
import { Fragment } from "react";
import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import AdSlot from "@/components/ads/AdSlot";
import { getArticlesByCategorySlug } from "@/lib/data/articles";
import { getCategoryBySlug } from "@/lib/data/categories";

export const revalidate = 60;

type Props = { params: Promise<{ category: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.seoTitle || `${category.hindiName} समाचार`,
    description: category.seoDescription || category.description || `${category.hindiName} की ताज़ा खबरें`,
    alternates: { canonical: `/${category.slug}` },
  };
}

const PAGE_SIZE = 12;

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const { page: pageParam } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.active) notFound();

  const page = Math.max(1, Number(pageParam) || 1);
  const articles = await getArticlesByCategorySlug(slug, PAGE_SIZE, (page - 1) * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-3 text-xs text-neutral-500">
        <a href="/" className="hover:underline">होम</a> / <span>{category.hindiName}</span>
      </nav>
      <h1 className="mb-4 border-b-2 border-red-700 pb-2 text-2xl font-black text-neutral-900">
        {category.hindiName}
      </h1>

      <AdSlot slotKey="CATEGORY_TOP" className="mb-6" />

      {articles.length === 0 ? (
        <p className="py-12 text-center text-neutral-500">इस श्रेणी में अभी कोई खबर उपलब्ध नहीं है।</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {articles.map((a, i) => (
            <Fragment key={a.slug}>
              <ArticleCard article={a} size="sm" />
              {i === 7 && (
                <div className="col-span-full">
                  <AdSlot slotKey="CATEGORY_IN_GRID" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-3 text-sm font-semibold">
        {page > 1 && (
          <a href={`/${slug}?page=${page - 1}`} className="rounded border px-4 py-2 hover:bg-neutral-50">
            ← पिछला
          </a>
        )}
        {articles.length === PAGE_SIZE && (
          <a href={`/${slug}?page=${page + 1}`} className="rounded border px-4 py-2 hover:bg-neutral-50">
            अगला →
          </a>
        )}
      </div>
    </div>
  );
}
