import { prisma } from "@/lib/prisma";

export type SeriesPoint = { key: string; label: string; value: number };

export type TopArticle = {
  id: string;
  hindiTitle: string;
  slug: string;
  viewCount: number;
  publishedAt: Date | null;
  category: { hindiName: string; slug: string };
};

export type Analytics = {
  totalViews: number;
  viewsToday: number;
  viewsThisMonth: number;
  viewsLast30Days: number;
  trackedArticles: number;
  daily: SeriesPoint[]; // last N days
  monthly: SeriesPoint[]; // last N months
  topArticles: TopArticle[];
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ym(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * First-party traffic analytics derived from the ArticleView table (daily
 * per-article counts) and Article.viewCount (per-article totals). No external
 * service required — the site records a view for every article read.
 */
export async function getAnalytics({ days = 30, months = 6, topN = 10 } = {}): Promise<Analytics> {
  const today = startOfToday();

  const dailySince = new Date(today);
  dailySince.setDate(dailySince.getDate() - (days - 1));

  const monthlySince = new Date(today);
  monthlySince.setDate(1);
  monthlySince.setMonth(monthlySince.getMonth() - (months - 1));

  const startOfMonth = new Date(today);
  startOfMonth.setDate(1);

  const rangeStart = dailySince < monthlySince ? dailySince : monthlySince;

  const [totalAgg, trackedArticles, rows, topArticles] = await Promise.all([
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.article.count({ where: { viewCount: { gt: 0 } } }),
    prisma.articleView.findMany({
      where: { date: { gte: rangeStart } },
      select: { date: true, count: true },
    }),
    prisma.article.findMany({
      where: { viewCount: { gt: 0 } },
      orderBy: { viewCount: "desc" },
      take: topN,
      select: {
        id: true,
        hindiTitle: true,
        slug: true,
        viewCount: true,
        publishedAt: true,
        category: { select: { hindiName: true, slug: true } },
      },
    }),
  ]);

  // Aggregate the fetched rows in memory (bounded to the chosen range).
  const byDay = new Map<string, number>();
  const byMonth = new Map<string, number>();
  let viewsToday = 0;
  let viewsThisMonth = 0;
  const todayKey = ymd(today);
  const monthKey = ym(today);

  for (const r of rows) {
    const d = new Date(r.date);
    const dk = ymd(d);
    const mk = ym(d);
    byDay.set(dk, (byDay.get(dk) ?? 0) + r.count);
    byMonth.set(mk, (byMonth.get(mk) ?? 0) + r.count);
    if (dk === todayKey) viewsToday += r.count;
    if (mk === monthKey) viewsThisMonth += r.count;
  }

  // Build a zero-filled daily series for the last `days`.
  const daily: SeriesPoint[] = [];
  let viewsLast30Days = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(dailySince);
    d.setDate(d.getDate() + i);
    const value = byDay.get(ymd(d)) ?? 0;
    viewsLast30Days += value;
    daily.push({
      key: ymd(d),
      // Sparse labels: only every ~5th day and the last day carry a label.
      label: i % 5 === 0 || i === days - 1 ? `${d.getDate()} ${MONTHS[d.getMonth()]}` : "",
      value,
    });
  }

  // Build a zero-filled monthly series for the last `months`.
  const monthly: SeriesPoint[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(monthlySince);
    d.setMonth(d.getMonth() + i);
    monthly.push({
      key: ym(d),
      label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      value: byMonth.get(ym(d)) ?? 0,
    });
  }

  return {
    totalViews: totalAgg._sum.viewCount ?? 0,
    viewsToday,
    viewsThisMonth,
    viewsLast30Days,
    trackedArticles,
    daily,
    monthly,
    topArticles,
  };
}
