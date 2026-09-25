import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, hasRole } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { prisma } from "@/lib/prisma";
import SubmitButton from "@/components/admin/SubmitButton";

export const metadata = { robots: { index: false, follow: false } };

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/articles", label: "Articles", icon: "📰" },
  { href: "/admin/media", label: "Media Library", icon: "🖼️" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/ads", label: "Ads", icon: "📢" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const isSuperAdmin = hasRole(session, "SUPER_ADMIN");
  const pendingCount = isSuperAdmin ? await prisma.article.count({ where: { status: "PENDING_REVIEW" } }) : 0;

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <aside className="hidden w-56 shrink-0 flex-col bg-neutral-900 text-neutral-200 md:flex">
        <div className="border-b border-neutral-800 px-4 py-4">
          <span className="text-lg font-black text-white">Vindhyaleader</span>
          <p className="text-xs text-neutral-400">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 p-3 text-sm">
          {isSuperAdmin && (
            <Link
              href="/admin/articles?status=PENDING_REVIEW"
              className="flex items-center justify-between rounded-md bg-amber-500/15 px-3 py-2 font-semibold text-amber-300 hover:bg-amber-500/25"
            >
              <span className="flex items-center gap-2">
                <span>🕓</span> Pending Review
              </span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-neutral-900">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-neutral-800"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-neutral-800 p-3 text-xs">
          <p className="mb-2 text-neutral-400">
            {session.name} ({isSuperAdmin ? "Super Admin" : session.role})
          </p>
          <form action={logoutAction}>
            <SubmitButton
              pendingText="Logging out…"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-neutral-800 py-1.5 hover:bg-neutral-700 disabled:opacity-60"
              spinnerClassName="h-3.5 w-3.5"
            >
              Logout
            </SubmitButton>
          </form>
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <span className="text-lg font-black text-red-700">Vindhyaleader Admin</span>
          <form action={logoutAction}>
            <SubmitButton
              pendingText="Logging out…"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-neutral-800 px-3 py-1.5 text-xs text-white disabled:opacity-60"
              spinnerClassName="h-3 w-3"
            >
              Logout
            </SubmitButton>
          </form>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
