import { notFound } from "next/navigation";
import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import AdSlot from "@/components/ads/AdSlot";
import { getArticlesByCategorySlug } from "@/lib/data/articles";
import { getCategoryBySlug } from "@/lib/data/categories";
import { categorySeo, pageMetadata } from "@/lib/seo";

export const revalidate = 60;

type Props = { params: Promise<{ category: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const { page: pageParam } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const page = Math.max(1, Number(pageParam) || 1);
  const seo = categorySeo(category);

  // Each listing page is its own canonical (pointing page 2+ at page 1 would
  // tell Google to ignore the older articles listed there).
  return pageMetadata({
    title: page > 1 ? `${seo.title} – पेज ${page}` : seo.title,
    description: seo.description,
    path: page > 1 ? `/${category.slug}?page=${page}` : `/${category.slug}`,
    keywords: seo.keywords,
  });
}

const PAGE_SIZE = 12;

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const { page: pageParam } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.active) notFound();

  const page = Math.max(1, Number(pageParam) || 1);
  const articles = await getArticlesByCategorySlug(slug, PAGE_SIZE, (page - 1) * PAGE_SIZE);
  const seo = categorySeo(category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-3 text-xs text-neutral-500">
        <Link href="/" className="hover:underline">होम</Link> /{" "}
        {category.parent && (
          <>
            <Link href={`/${category.parent.slug}`} className="hover:underline">{category.parent.hindiName}</Link> /{" "}
          </>
        )}
        <span>{category.hindiName}</span>
      </nav>
      <h1 className="border-b-2 border-red-700 pb-2 text-2xl font-black text-neutral-900">{seo.heading}</h1>
      <p className="mb-4 mt-2 text-sm text-neutral-500">{seo.intro}</p>

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
