import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import AdSlot from "@/components/ads/AdSlot";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data/articles";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { removeFirstImageByUrl } from "@/lib/article-images";
import ViewTracker from "@/components/ViewTracker";

export const revalidate = 60;

type Props = { params: Promise<{ category: string; slug: string }> };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "PUBLISHED") return {};

  const title = article.seoTitle || article.hindiTitle;
  const description = article.seoDescription || article.excerpt || undefined;
  const image = article.socialImage?.url || article.featuredImage?.url;

  return {
    title,
    description,
    alternates: { canonical: article.canonicalUrl || `/${article.category.slug}/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      images: image ? [image] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function ArticlePage({ params }: Props) {
  const { category: categorySlug, slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.status !== "PUBLISHED" || article.category.slug !== categorySlug) {
    notFound();
  }

  const related = await getRelatedArticles(article.categoryId, article.id, 4);
  const url = `${siteUrl}/${article.category.slug}/${article.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        headline: article.hindiTitle,
        image: article.featuredImage ? [article.featuredImage.url] : undefined,
        datePublished: article.publishedAt?.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        author: { "@type": "Person", name: article.author.name },
        publisher: {
          "@type": "Organization",
          name: "विंध्यलीडर",
          logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        articleSection: article.category.hindiName,
        description: article.excerpt ?? undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "होम", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: article.category.hindiName,
            item: `${siteUrl}/${article.category.slug}`,
          },
          { "@type": "ListItem", position: 3, name: article.hindiTitle, item: url },
        ],
      },
    ],
  };

  const shareText = encodeURIComponent(article.hindiTitle);
  const shareUrl = encodeURIComponent(url);

  // The cover image is shown in its own <figure> above; if it was auto-derived
  // from the body's first image, drop that first image from the body so it
  // isn't displayed twice.
  let bodyForRender = sanitizeArticleHtml(article.bodyHtml);
  if (article.featuredImage) {
    bodyForRender = removeFirstImageByUrl(bodyForRender, article.featuredImage.url);
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-6">
      <ViewTracker articleId={article.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-3 text-xs text-neutral-500">
        <Link href="/" className="hover:underline">होम</Link> /{" "}
        <Link href={`/${article.category.slug}`} className="hover:underline">
          {article.category.hindiName}
        </Link>
      </nav>

      <span className="mb-2 inline-block rounded bg-red-700 px-2 py-0.5 text-xs font-bold text-white">
        {article.category.hindiName}
      </span>
      <h1 className="mb-3 text-2xl font-black leading-tight text-neutral-900 md:text-3xl">
        {article.hindiTitle}
      </h1>
      {article.excerpt && <p className="mb-3 text-lg text-neutral-600">{article.excerpt}</p>}

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
        <span>
          <Link href={`/author/${article.author.id}`} className="font-semibold text-neutral-700 hover:text-red-700">
            {article.author.name}
          </Link>
        </span>
        <span>•</span>
        <time>{formatDate(article.publishedAt)}</time>
        {article.location && (
          <>
            <span>•</span>
            <span>{article.location}</span>
          </>
        )}
      </div>

      <AdSlot slotKey="ARTICLE_TOP" className="mb-5" />

      {article.featuredImage && (
        <figure className="mb-5">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-neutral-100">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.altText ?? article.hindiTitle}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
          {article.imageCaption && (
            <figcaption className="mt-1 text-xs text-neutral-500">{article.imageCaption}</figcaption>
          )}
        </figure>
      )}

      <div
        className="prose prose-neutral max-w-none prose-headings:font-bold prose-a:text-red-700"
        dangerouslySetInnerHTML={{ __html: bodyForRender }}
      />

      <AdSlot slotKey="ARTICLE_BOTTOM" className="my-6" />

      <div className="mb-6 flex flex-wrap items-center gap-3 border-y border-neutral-200 py-3 text-sm">
        <span className="font-semibold text-neutral-600">शेयर करें:</span>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Facebook</a>
        <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">WhatsApp</a>
        <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="text-neutral-800 hover:underline">X</a>
      </div>

      {article.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {article.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/search?q=${encodeURIComponent(tag.name)}`}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-200"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 border-b-2 border-red-700 pb-1 text-lg font-bold">संबंधित खबरें</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((r) => (
              <ArticleCard key={r.slug} article={r} size="sm" />
            ))}
          </div>
        </section>
      )}

    </article>
  );
}
