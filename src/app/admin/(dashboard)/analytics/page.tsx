import Link from "next/link";
import { getAnalytics } from "@/lib/data/analytics";
import BarChart from "@/components/admin/BarChart";

export const metadata = { title: "Analytics" };
export const revalidate = 60;

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function Kpi({ label, value, hint, accent }: { label: string; value: number; hint?: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`mt-1 text-3xl font-black ${accent ?? "text-neutral-900"}`}>{fmt(value)}</p>
      {hint && <p className="mt-0.5 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const a = await getAnalytics({ days: 30, months: 6, topN: 10 });
  const topMax = Math.max(1, ...a.topArticles.map((t) => t.viewCount));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">Analytics</h1>
          <p className="text-sm text-neutral-500">Website traffic &amp; article readership</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500">Page views · first-party</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total Views" value={a.totalViews} hint="All time" accent="text-red-700" />
        <Kpi label="This Month" value={a.viewsThisMonth} hint="Since the 1st" />
        <Kpi label="Last 30 Days" value={a.viewsLast30Days} />
        <Kpi label="Today" value={a.viewsToday} hint={`${fmt(a.trackedArticles)} articles with views`} />
      </div>

      {/* Daily trend */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Daily views — last 30 days</h2>
          <span className="text-sm text-neutral-400">{fmt(a.viewsLast30Days)} total</span>
        </div>
        <BarChart data={a.daily} height={190} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly trend */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Monthly views — last 6 months</h2>
          <BarChart data={a.monthly} height={170} barClassName="bg-neutral-800 group-hover:bg-neutral-900" />
        </div>

        {/* Quick facts */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Overview</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <dt className="text-neutral-500">Total article views</dt>
              <dd className="font-bold text-neutral-900">{fmt(a.totalViews)}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <dt className="text-neutral-500">Views this month</dt>
              <dd className="font-bold text-neutral-900">{fmt(a.viewsThisMonth)}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <dt className="text-neutral-500">Avg. views / day (30d)</dt>
              <dd className="font-bold text-neutral-900">{fmt(Math.round(a.viewsLast30Days / 30))}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-neutral-500">Articles with readership</dt>
              <dd className="font-bold text-neutral-900">{fmt(a.trackedArticles)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Top articles — the key per-article metric */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Most-read articles</h2>
        {a.topArticles.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-400">No views recorded yet.</p>
        ) : (
          <ol className="space-y-2.5">
            {a.topArticles.map((t, i) => (
              <li key={t.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-black text-neutral-500">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/${t.category.slug}/${t.slug}`}
                      target="_blank"
                      className="line-clamp-1 text-sm font-semibold text-neutral-800 hover:text-red-700"
                    >
                      {t.hindiTitle}
                    </Link>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-neutral-900">{fmt(t.viewCount)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${(t.viewCount / topMax) * 100}%` }} />
                    </div>
                    <span className="shrink-0 text-[11px] text-neutral-400">
                      {t.category.hindiName} · {formatDate(t.publishedAt)}
                    </span>
                  </div>
                </div>
                <Link href={`/admin/articles/${t.id}/edit`} className="shrink-0 text-xs text-blue-700 hover:underline">
                  Edit
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="text-xs text-neutral-400">
        Counts are page views recorded first-party (one per visitor session per article). Full visitor sessions are also
        available in Google Analytics if a GA4 ID is configured in Settings.
      </p>
    </div>
  );
}
