import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import { searchArticles } from "@/lib/data/articles";

export const metadata: Metadata = { title: "खोज परिणाम" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchArticles(query, 24) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <form action="/search" method="get" className="mb-6 flex max-w-lg">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="खबर खोजें..."
          className="w-full rounded-l-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-700"
        />
        <button type="submit" className="rounded-r-md border border-l-0 border-neutral-300 bg-neutral-900 px-4 text-sm text-white">
          खोजें
        </button>
      </form>

      {query ? (
        <>
          <h1 className="mb-4 text-lg font-semibold text-neutral-700">
            &ldquo;{query}&rdquo; के लिए {results.length} परिणाम मिले
          </h1>
          {results.length === 0 ? (
            <p className="text-neutral-500">कोई खबर नहीं मिली। कृपया कोई और शब्द आज़माएँ।</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
              {results.map((a) => (
                <ArticleCard key={a.slug} article={a} size="sm" />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-neutral-500">खोजने के लिए ऊपर कोई शब्द लिखें।</p>
      )}
    </div>
  );
}
