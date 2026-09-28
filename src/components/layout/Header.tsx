import Link from "next/link";
import { getNavCategories } from "@/lib/data/categories";
import { LogoMark } from "@/components/Logo";
import MobileNav from "./MobileNav";

export default async function Header() {
  const categories = await getNavCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      {/* Utility bar */}
      <div className="hidden items-center justify-end gap-4 border-b border-neutral-100 bg-white px-4 py-1 text-xs text-neutral-500 md:flex">
        <Link href="/contact-us" className="hover:text-red-700">
          संपर्क करें
        </Link>
        <Link href="/admin/login" className="hover:text-red-700">
          Admin Login
        </Link>
      </div>

      {/* Main bar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex shrink-0 items-center gap-3">
          <MobileNav categories={categories} />
          <Link href="/" className="group flex items-center gap-3">
            <LogoMark
              className="h-12 w-12 shrink-0 drop-shadow-sm transition-transform group-hover:scale-105 md:h-14 md:w-14"
              instanceId="header"
            />
            {/* Subtitle is absolutely positioned so the wordmark (not the wordmark+subtitle
                stack) is what vertically centers against the logo icon. */}
            <span className="relative flex flex-col justify-center">
              <span className="block bg-gradient-to-r from-red-700 via-red-600 to-orange-500 bg-clip-text py-1 font-display text-[2.5rem] leading-[1.4] font-extrabold tracking-tight text-transparent drop-shadow-sm md:text-[3.25rem]">
                विंध्यलीडर
              </span>
              <span className="absolute inset-x-0 bottom-1 hidden translate-y-full items-center gap-2 md:flex">
                <span className="h-px w-6 bg-gradient-to-r from-red-600 to-orange-400" />
                <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.35em] text-neutral-400">
                  Vindhya Leader
                </span>
              </span>
            </span>
          </Link>
        </div>

        <form action="/search" method="get" className="hidden max-w-md flex-1 md:flex">
          <input
            type="search"
            name="q"
            placeholder="खबर खोजें..."
            className="w-full rounded-l-md border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-red-700"
          />
          <button
            type="submit"
            className="rounded-r-md border border-l-0 border-neutral-300 bg-neutral-900 px-3 text-sm text-white"
            aria-label="खोजें"
          >
            🔍
          </button>
        </form>

        <Link
          href="/search"
          className="rounded-full border border-neutral-300 p-2 text-sm md:hidden"
          aria-label="खोजें"
        >
          🔍
        </Link>
      </div>

      {/* Desktop nav */}
      <nav className="hidden overflow-x-auto border-t border-neutral-100 px-4 md:block">
        <ul className="flex w-max items-center gap-5 py-2 text-sm font-semibold text-neutral-800">
          <li>
            <Link href="/" className="hover:text-red-700">
              होम
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id} className="group relative">
              <Link href={`/${cat.slug}`} className="hover:text-red-700">
                {cat.hindiName}
              </Link>
              {cat.children.length > 0 && (
                <div className="absolute left-0 top-full z-50 hidden min-w-[180px] flex-col rounded-b-md border border-neutral-200 bg-white py-2 shadow-lg group-hover:flex">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/${child.slug}`}
                      className="px-4 py-1.5 text-sm font-normal text-neutral-700 hover:bg-neutral-50 hover:text-red-700"
                    >
                      {child.hindiName}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
