import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth";

export const metadata = { title: "डैशबोर्ड" };

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
  DRAFT: "ड्राफ्ट",
  PENDING_REVIEW: "समीक्षा हेतु लंबित",
  SCHEDULED: "निर्धारित",
  PUBLISHED: "प्रकाशित",
  UNPUBLISHED: "अप्रकाशित",
  ARCHIVED: "संग्रहीत",
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  const isSuperAdmin = hasRole(session, "SUPER_ADMIN");
  const stats = await getStats();

  const cards = [
    { label: "आज की खबरें", value: stats.today },
    { label: "प्रकाशित", value: stats.published },
    { label: "ड्राफ्ट", value: stats.drafts },
    { label: "निर्धारित", value: stats.scheduled },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">डैशबोर्ड</h1>
        <Link href="/admin/articles/new" className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
          + नई खबर जोड़ें
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
            <p className="text-sm font-medium text-amber-700">समीक्षा हेतु लंबित</p>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">हाल की खबरें</h2>
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
          <h2 className="mb-3 font-semibold">ब्रेकिंग न्यूज़ (सक्रिय)</h2>
          <ul className="divide-y divide-neutral-100 text-sm">
            {stats.breaking.length === 0 && <li className="py-2 text-neutral-400">कोई सक्रिय ब्रेकिंग खबर नहीं।</li>}
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
