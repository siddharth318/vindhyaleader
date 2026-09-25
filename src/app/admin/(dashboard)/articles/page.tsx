import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth";
import SubmitButton from "@/components/admin/SubmitButton";
import {
  approveArticleAction,
  deleteArticleAction,
  rejectArticleAction,
  toggleArticleStatusAction,
} from "@/lib/actions/article-actions";

export const metadata = { title: "समाचार प्रबंधन" };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "ड्राफ्ट",
  PENDING_REVIEW: "समीक्षा हेतु लंबित",
  SCHEDULED: "निर्धारित",
  PUBLISHED: "प्रकाशित",
  UNPUBLISHED: "अप्रकाशित",
  ARCHIVED: "संग्रहीत",
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-600",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-700",
  UNPUBLISHED: "bg-neutral-200 text-neutral-600",
  ARCHIVED: "bg-neutral-100 text-neutral-500",
};

export default async function ArticlesListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;
  const session = await getSession();
  const isEditor = hasRole(session, "EDITOR");
  const isSuperAdmin = hasRole(session, "SUPER_ADMIN");

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    where: {
      ...(isEditor ? {} : { authorId: session?.userId }),
      ...(statusFilter ? { status: statusFilter as never } : {}),
    },
    select: {
      id: true,
      hindiTitle: true,
      status: true,
      createdAt: true,
      viewCount: true,
      category: { select: { hindiName: true } },
      author: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          समाचार प्रबंधन
          {statusFilter === "PENDING_REVIEW" && <span className="ml-2 text-sm font-normal text-amber-700">— समीक्षा हेतु लंबित</span>}
        </h1>
        <div className="flex items-center gap-3">
          {statusFilter && (
            <Link href="/admin/articles" className="text-sm text-neutral-500 hover:underline">
              फ़िल्टर हटाएँ
            </Link>
          )}
          <Link href="/admin/articles/new" className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
            + नई खबर
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-2">शीर्षक</th>
              <th className="px-4 py-2">श्रेणी</th>
              <th className="px-4 py-2">लेखक</th>
              <th className="px-4 py-2">स्थिति</th>
              <th className="px-4 py-2">Views</th>
              <th className="px-4 py-2">कार्रवाई</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {articles.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2 font-medium">
                  <Link href={`/admin/articles/${a.id}/edit`} className="hover:text-red-700">
                    {a.hindiTitle}
                  </Link>
                </td>
                <td className="px-4 py-2 text-neutral-500">{a.category.hindiName}</td>
                <td className="px-4 py-2 text-neutral-500">{a.author.name}</td>
                <td className="px-4 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[a.status]}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </td>
                <td className="px-4 py-2 font-semibold tabular-nums text-neutral-700">
                  {a.viewCount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/articles/${a.id}/edit`} className="text-blue-700 hover:underline">
                      संपादित करें
                    </Link>
                    {isSuperAdmin && a.status === "PENDING_REVIEW" && (
                      <>
                        <form action={approveArticleAction.bind(null, a.id)}>
                          <SubmitButton className="inline-flex items-center gap-1.5 font-semibold text-green-700 hover:underline disabled:opacity-50">✓ स्वीकृत व प्रकाशित करें</SubmitButton>
                        </form>
                        <form action={rejectArticleAction.bind(null, a.id)}>
                          <SubmitButton className="inline-flex items-center gap-1.5 text-red-700 hover:underline disabled:opacity-50">✕ अस्वीकृत करें</SubmitButton>
                        </form>
                      </>
                    )}
                    {isSuperAdmin && a.status === "PUBLISHED" && (
                      <form action={toggleArticleStatusAction.bind(null, a.id, "UNPUBLISHED")}>
                        <SubmitButton className="inline-flex items-center gap-1.5 text-amber-700 hover:underline disabled:opacity-50">अप्रकाशित करें</SubmitButton>
                      </form>
                    )}
                    {isEditor && (
                      <form action={deleteArticleAction.bind(null, a.id)}>
                        <SubmitButton
                          confirm="इस खबर को हटाना निश्चित है?"
                          className="inline-flex items-center gap-1.5 text-red-700 hover:underline disabled:opacity-50"
                        >
                          हटाएँ
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && <p className="p-6 text-center text-neutral-400">अभी कोई खबर नहीं है।</p>}
      </div>
    </div>
  );
}
