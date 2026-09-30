import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import AdSlot from "@/components/ads/AdSlot";
import { getLatestArticles } from "@/lib/data/articles";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const title = "ताज़ा खबरें – Latest News: सोनभद्र, पूर्वांचल व उत्तर प्रदेश की लेटेस्ट न्यूज़";
  return pageMetadata({
    title: page > 1 ? `${title} – पेज ${page}` : title,
    description:
      "सोनभद्र, राबर्ट्सगंज, पूर्वांचल, उत्तर प्रदेश और देश-दुनिया की सबसे ताज़ा खबरें, मिनट-दर-मिनट। Latest Sonbhadra & Purvanchal news in Hindi.",
    path: page > 1 ? `/latest?page=${page}` : "/latest",
    keywords: ["ताज़ा खबरें", "लेटेस्ट न्यूज़", "आज की खबर", "Latest News", "Sonbhadra Latest News", "Purvanchal Latest News"],
  });
}

const PAGE_SIZE = 16;

export default async function LatestPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const articles = await getLatestArticles(PAGE_SIZE, (page - 1) * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 border-b-2 border-red-700 pb-2 text-2xl font-black">ताज़ा खबरें</h1>
      <AdSlot slotKey="CATEGORY_TOP" className="mb-6" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} size="sm" />
        ))}
      </div>
      <div className="mt-8 flex justify-center gap-3 text-sm font-semibold">
        {page > 1 && (
          <a href={`/latest?page=${page - 1}`} className="rounded border px-4 py-2 hover:bg-neutral-50">
            ← पिछला
          </a>
        )}
        {articles.length === PAGE_SIZE && (
          <a href={`/latest?page=${page + 1}`} className="rounded border px-4 py-2 hover:bg-neutral-50">
            अगला →
          </a>
        )}
      </div>
    </div>
  );
}
