import ArticleCard from "@/components/ArticleCard";
import BreakingTicker from "@/components/BreakingTicker";
import SectionHeading from "@/components/SectionHeading";
import AdSlot from "@/components/ads/AdSlot";
import {
  getFeaturedArticles,
  getLatestArticles,
  getMostViewedArticles,
} from "@/lib/data/articles";
import { getNavCategories } from "@/lib/data/categories";
import { categoryAccent } from "@/lib/categoryColors";
import CategoryPillNav from "@/components/CategoryPillNav";
import { prisma } from "@/lib/prisma";
import { HOME_DESCRIPTION, HOME_TITLE, REGIONS, SITE_KEYWORDS, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: HOME_TITLE,
  absoluteTitle: true,
  description: HOME_DESCRIPTION,
  path: "/",
  keywords: SITE_KEYWORDS,
});

async function getCategoryRail(slug: string, take = 4) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() }, category: { slug } },
    orderBy: { publishedAt: "desc" },
    take,
    select: {
      slug: true,
      hindiTitle: true,
      excerpt: true,
      publishedAt: true,
      location: true,
      isBreaking: true,
      isTrending: true,
      featuredImage: { select: { url: true, altText: true } },
      category: { select: { hindiName: true, slug: true } },
    },
  });
}

export default async function HomePage() {
  const [featured, latest, mostViewed, navCategories] = await Promise.all([
    getFeaturedArticles(6),
    getLatestArticles(9),
    getMostViewedArticles(5),
    getNavCategories(),
  ]);

  const [hero, ...secondary] = featured.length ? featured : latest.slice(0, 6);

  // Pick a handful of rail categories dynamically from the nav tree.
  const railCategories = navCategories.slice(0, 4);
  const rails = await Promise.all(
    railCategories.map(async (c) => ({
      category: c,
      articles: await getCategoryRail(c.slug, 4),
    }))
  );

  return (
    <div className="bg-neutral-50">
      {/* The page's topical H1 (the logo wordmark isn't a heading). Visually hidden;
          the same message is shown in the "coverage" section at the bottom. */}
      <h1 className="sr-only">विंध्यलीडर – सोनभद्र न्यूज़, राबर्ट्सगंज व पूर्वांचल की ताज़ा हिंदी खबरें (Sonbhadra News)</h1>

      {/* Slogan strip — dark masthead tone, deliberately distinct from the red breaking ticker below */}
      <div className="border-b border-neutral-800 bg-neutral-900">
        {/* Full-width like the header; slogan indented on desktop to sit under the
            "विंध्यलीडर" wordmark (56px logo + 12px gap = 68px past the logo edge). */}
        <div className="flex items-center justify-between px-4 py-2">
          <p className="font-display text-xs font-bold tracking-wide md:ml-[68px] md:text-sm">
            <span className="slogan-mic mr-1" aria-hidden="true">🎙️</span>
            <span className="slogan-shimmer">आपकी अपनी आवाज़</span>
            <span className="text-neutral-400"> — सच्ची, तेज़ और निष्पक्ष खबरें</span>
          </p>
          <p className="hidden text-xs font-medium text-neutral-400 md:block">
            {new Intl.DateTimeFormat("hi-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </p>
        </div>
      </div>

      <BreakingTicker />

      <div className="mx-auto max-w-6xl px-4 py-4">
        {/* Quick category pill nav */}
        <CategoryPillNav categories={navCategories} />

        {/* Hero grid: main story + secondary story strip */}
        {hero && (
          <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            <div className="lg:h-[420px]">
              <ArticleCard article={hero} size="lg" />
            </div>
            <div className="flex flex-col gap-3 lg:h-[420px] lg:overflow-y-auto lg:pr-1">
              {secondary.slice(0, 4).map((a) => (
                <ArticleCard key={a.slug} article={a} size="strip" />
              ))}
            </div>
          </section>
        )}

        <div className="my-6">
          <AdSlot slotKey="HOME_BELOW_HERO" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            {/* Latest news */}
            <section className="mb-10">
              <SectionHeading title="ताज़ा खबरें" href="/latest" icon="🕐" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {latest.map((a) => (
                  <ArticleCard key={a.slug} article={a} size="sm" />
                ))}
              </div>
            </section>

            <div className="my-6">
              <AdSlot slotKey="HOME_BETWEEN_SECTIONS" />
            </div>

            {/* Category rails */}
            {rails.map(({ category, articles }, idx) => {
              const accent = categoryAccent(category.slug);
              return articles.length ? (
                <div key={category.id}>
                  <section className="mb-10">
                    <SectionHeading title={category.hindiName} href={`/${category.slug}`} accent={accent.solid} />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {articles.map((a) => (
                        <ArticleCard key={a.slug} article={a} size="sm" />
                      ))}
                    </div>
                  </section>
                  {idx % 2 === 1 && (
                    <div className="my-6">
                      <AdSlot slotKey="HOME_BETWEEN_SECTIONS" />
                    </div>
                  )}
                </div>
              ) : null;
            })}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <AdSlot slotKey="SIDEBAR_TOP" />
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <SectionHeading title="सबसे ज़्यादा पढ़ी गई" href="/latest" accent="bg-amber-500" icon="🔥" />
              <ol className="space-y-3">
                {mostViewed.map((a, i) => (
                  <li key={a.slug}>
                    <Link
                      href={`/${a.category.slug}/${a.slug}`}
                      className="group flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-neutral-50"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-xs font-black text-white">
                        {i + 1}
                      </span>
                      {a.featuredImage ? (
                        <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                          <Image src={a.featuredImage.url} alt="" fill sizes="56px" className="object-cover" />
                        </div>
                      ) : null}
                      <span className="line-clamp-2 text-sm font-semibold text-neutral-800 group-hover:text-red-700">
                        {a.hindiTitle}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        {/* Coverage area — who we are and where we report from (also the page's key regional copy). */}
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="font-display text-lg font-extrabold text-neutral-900 md:text-xl">
            सोनभद्र व पूर्वांचल की हर खबर, सबसे पहले
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            विंध्यलीडर सोनभद्र जिले के मुख्यालय राबर्ट्सगंज से प्रकाशित क्षेत्रीय हिंदी समाचार पोर्टल है। हम
            सोनभद्र की ताज़ा खबरें, ब्रेकिंग न्यूज़ और हर कस्बे-गाँव की जनसमस्याएँ आप तक सबसे पहले पहुँचाते हैं — साथ
            ही मिर्जापुर, वाराणसी, चंदौली, गाजीपुर समेत पूरे पूर्वांचल और उत्तर प्रदेश की खबरें।
          </p>
          <p className="mt-2 text-xs leading-relaxed text-neutral-400">
            Vindhya Leader is a Hindi news portal and newspaper from Robertsganj, Sonbhadra (Uttar Pradesh) — your source for
            the latest Sonbhadra news, Robertsganj news and breaking news from across Purvanchal.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.slug}`}
                className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-100 hover:bg-red-100"
              >
                {r.hi} न्यूज़
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-600">सोनभद्र के प्रमुख क्षेत्र: </span>
            {REGIONS[0].towns.map((t) => t.hi).join(" · ")}
          </p>
        </section>

        <div className="my-6">
          <AdSlot slotKey="FOOTER_TOP" />
        </div>
      </div>
    </div>
  );
}


