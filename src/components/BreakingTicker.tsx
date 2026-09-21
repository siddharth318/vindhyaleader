import Link from "next/link";
import { getBreakingArticles } from "@/lib/data/articles";

export default async function BreakingTicker() {
  const articles = await getBreakingArticles(8);
  if (articles.length === 0) return null;

  return (
    <div className="flex items-stretch border-y border-red-800 bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white shadow-sm">
      <span className="flex shrink-0 items-center gap-1.5 bg-black/20 px-3 py-1.5 text-xs font-bold tracking-wide backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        ब्रेकिंग
      </span>
      <div className="ticker-mask flex-1 overflow-hidden">
        <div className="ticker-track flex w-max items-center gap-10 py-1.5 text-sm font-medium">
          {[...articles, ...articles].map((a, i) => (
            <Link
              key={`${a.slug}-${i}`}
              href={`/${a.category.slug}/${a.slug}`}
              className="whitespace-nowrap hover:underline"
            >
              {a.hindiTitle}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
