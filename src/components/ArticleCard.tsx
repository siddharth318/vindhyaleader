import Link from "next/link";
import Image from "next/image";
import { categoryAccent } from "@/lib/categoryColors";

export type ArticleCardData = {
  slug: string;
  hindiTitle: string;
  excerpt?: string | null;
  publishedAt: Date | null;
  location?: string | null;
  isBreaking?: boolean;
  isTrending?: boolean;
  featuredImage?: { url: string; altText: string | null } | null;
  category: { hindiName: string; slug: string };
};

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "red" | "amber" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${
        tone === "red" ? "bg-red-600" : "bg-amber-500"
      }`}
    >
      {tone === "red" ? "🔴" : "🔥"} {children}
    </span>
  );
}

/** Full-bleed hero variant: image with gradient overlay + headline on top (magazine style). */
function HeroCard({ article }: { article: ArticleCardData }) {
  const href = `/${article.category.slug}/${article.slug}`;
  const accent = categoryAccent(article.category.slug);

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
      <Link href={href} className="absolute inset-0 z-0">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.altText ?? article.hindiTitle}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      </Link>
      <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-end gap-3 p-5 md:min-h-[420px] md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${article.category.slug}`}
            className={`rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm ${accent.solid}`}
          >
            {article.category.hindiName}
          </Link>
          {article.isBreaking && <Badge tone="red">ब्रेकिंग</Badge>}
          {article.isTrending && <Badge tone="amber">ट्रेंडिंग</Badge>}
        </div>
        <Link href={href}>
          <h1 className="text-2xl font-black leading-tight text-white drop-shadow-sm md:text-4xl md:leading-tight">
            {article.hindiTitle}
          </h1>
        </Link>
        {article.excerpt && (
          <p className="hidden max-w-2xl text-sm text-neutral-200 md:line-clamp-2 md:block">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
          {article.location && <span>📍 {article.location}</span>}
          <time>{formatDate(article.publishedAt)}</time>
        </div>
      </div>
    </article>
  );
}

/** Compact overlay card used for secondary hero slots — small thumbnail + caption strip. */
function StripCard({ article }: { article: ArticleCardData }) {
  const href = `/${article.category.slug}/${article.slug}`;
  const accent = categoryAccent(article.category.slug);

  return (
    <article className="group relative flex gap-3 overflow-hidden rounded-xl bg-white p-2 ring-1 ring-black/5 transition-all hover:shadow-md">
      <Link href={href} className="relative block h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.altText ?? article.hindiTitle}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-[10px] font-bold text-white">
            विंध्यलीडर
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-col justify-center gap-1">
        <span className={`w-fit rounded px-1.5 py-0.5 text-[10px] font-bold ${accent.bg} ${accent.text}`}>
          {article.category.hindiName}
        </span>
        <Link href={href}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-neutral-900 group-hover:text-red-700">
            {article.hindiTitle}
          </h3>
        </Link>
        <time className="text-[11px] text-neutral-400">{formatDate(article.publishedAt)}</time>
      </div>
    </article>
  );
}

/** Standard grid card used across latest/category/search rails. */
function GridCard({ article, dense }: { article: ArticleCardData; dense?: boolean }) {
  const href = `/${article.category.slug}/${article.slug}`;
  const accent = categoryAccent(article.category.slug);

  return (
    <article className="group flex flex-col gap-2 overflow-hidden rounded-xl bg-white ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.altText ?? article.hindiTitle}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-sm font-bold text-white">
            विंध्यलीडर
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          {article.isBreaking && <Badge tone="red">ब्रेकिंग</Badge>}
          {article.isTrending && !article.isBreaking && <Badge tone="amber">ट्रेंड</Badge>}
        </div>
      </Link>
      <div className={`flex flex-1 flex-col gap-1.5 px-3 ${dense ? "pb-3" : "pb-4"}`}>
        <div className="flex items-center gap-2 text-xs">
          <Link href={`/${article.category.slug}`} className={`font-bold ${accent.text} hover:underline`}>
            {article.category.hindiName}
          </Link>
          <span className="text-neutral-300">•</span>
          <time className="text-neutral-400">{formatDate(article.publishedAt)}</time>
        </div>
        <Link href={href}>
          <h3 className={`font-bold leading-snug text-neutral-900 group-hover:text-red-700 ${dense ? "text-sm" : "text-base"}`}>
            {article.hindiTitle}
          </h3>
        </Link>
      </div>
    </article>
  );
}

export default function ArticleCard({
  article,
  size = "md",
}: {
  article: ArticleCardData;
  size?: "sm" | "md" | "lg" | "strip";
}) {
  if (size === "lg") return <HeroCard article={article} />;
  if (size === "strip") return <StripCard article={article} />;
  return <GridCard article={article} dense={size === "sm"} />;
}
