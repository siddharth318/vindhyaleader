import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth";
import { getAnalytics } from "@/lib/data/analytics";
import BarChart from "@/components/admin/BarChart";

export const metadata = { title: "Dashboard" };

async function getStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [total, published, drafts, scheduled, pendingReview, today, recent, breaking] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "SCHEDULED" } }),
    prisma.article.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.article.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, hindiTitle: true, status: true, createdAt: true, category: { select: { hindiName: true } } },
    }),
    prisma.article.findMany({
      where: { isBreaking: true, status: "PUBLISHED" },
      take: 5,
      orderBy: { publishedAt: "desc" },
      select: { id: true, hindiTitle: true },
    }),
  ]);

  return { total, published, drafts, scheduled, pendingReview, today, recent, breaking };
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  UNPUBLISHED: "Unpublished",
  ARCHIVED: "Archived",
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  const isSuperAdmin = hasRole(session, "SUPER_ADMIN");
  const [stats, analytics] = await Promise.all([getStats(), getAnalytics({ days: 14, months: 6, topN: 5 })]);

  const cards = [
    { label: "Today's Articles", value: stats.today },
    { label: "Published", value: stats.published },
    { label: "Drafts", value: stats.drafts },
    { label: "Scheduled", value: stats.scheduled },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Link href="/admin/articles/new" className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
          + Add New Article
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-2xl font-black text-neutral-900">{c.value}</p>
            <p className="text-sm text-neutral-500">{c.label}</p>
          </div>
        ))}
        {isSuperAdmin && (
          <Link
            href="/admin/articles?status=PENDING_REVIEW"
            className="rounded-lg border border-amber-300 bg-amber-50 p-4 transition-colors hover:bg-amber-100"
          >
            <p className="text-2xl font-black text-amber-700">{stats.pendingReview}</p>
            <p className="text-sm font-medium text-amber-700">Pending Review</p>
          </Link>
        )}
      </div>

      {/* Traffic overview */}
      <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Traffic overview</h2>
          <Link href="/admin/analytics" className="text-sm font-medium text-red-700 hover:underline">
            View full analytics →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xl font-black text-red-700">{analytics.totalViews.toLocaleString("en-IN")}</p>
              <p className="text-xs text-neutral-500">Total Views</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xl font-black text-neutral-900">{analytics.viewsThisMonth.toLocaleString("en-IN")}</p>
              <p className="text-xs text-neutral-500">This Month</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xl font-black text-neutral-900">{analytics.viewsToday.toLocaleString("en-IN")}</p>
              <p className="text-xs text-neutral-500">Today</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-neutral-500">Last 14 days</p>
            <BarChart data={analytics.daily} height={90} />
          </div>
        </div>
        {analytics.topArticles.length > 0 && (
          <div className="mt-5 border-t border-neutral-100 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Most-read articles</p>
            <ul className="space-y-1.5 text-sm">
              {analytics.topArticles.map((t, i) => (
                <li key={t.id} className="flex items-center justify-between gap-3">
                  <Link href={`/admin/articles/${t.id}/edit`} className="line-clamp-1 min-w-0 hover:text-red-700">
                    <span className="text-neutral-400">{i + 1}.</span> {t.hindiTitle}
                  </Link>
                  <span className="shrink-0 font-bold tabular-nums text-neutral-900">
                    {t.viewCount.toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Recent Articles</h2>
          <ul className="divide-y divide-neutral-100 text-sm">
            {stats.recent.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 py-2">
                <Link href={`/admin/articles/${a.id}/edit`} className="line-clamp-1 hover:text-red-700">
                  {a.hindiTitle}
                </Link>
                <span className="shrink-0 rounded bg-neutral-100 px-2 py-0.5 text-xs">
                  {STATUS_LABEL[a.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Breaking News (Active)</h2>
          <ul className="divide-y divide-neutral-100 text-sm">
            {stats.breaking.length === 0 && <li className="py-2 text-neutral-400">No active breaking news.</li>}
            {stats.breaking.map((a) => (
              <li key={a.id} className="py-2">
                <Link href={`/admin/articles/${a.id}/edit`} className="hover:text-red-700">
                  {a.hindiTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
