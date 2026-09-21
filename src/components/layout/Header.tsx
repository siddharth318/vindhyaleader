import Link from "next/link";
import { getNavCategories } from "@/lib/data/categories";
import { LogoMark } from "@/components/Logo";
import MobileNav from "./MobileNav";

function formatToday() {
  return new Intl.DateTimeFormat("hi-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default async function Header() {
  const categories = await getNavCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      {/* Utility bar */}
      <div className="hidden items-center justify-between border-b border-neutral-100 bg-neutral-50 px-4 py-1 text-xs text-neutral-500 md:flex">
        <span>{formatToday()}</span>
        <div className="flex items-center gap-4">
          <Link href="/contact-us" className="hover:text-red-700">
            संपर्क करें
          </Link>
          <Link href="/admin/login" className="hover:text-red-700">
            एडमिन लॉगिन
          </Link>
        </div>
      </div>

      {/* Main bar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex shrink-0 items-center gap-3">
          <MobileNav categories={categories} />
          <Link href="/" className="group flex items-center gap-3">
            <LogoMark
              className="h-12 w-12 shrink-0 shadow-md shadow-red-700/30 ring-1 ring-red-800/20 transition-transform group-hover:scale-105 md:h-14 md:w-14"
              instanceId="header"
            />
            <span className="flex flex-col justify-center">
              <span className="bg-gradient-to-r from-red-700 via-red-600 to-orange-600 bg-clip-text py-1 font-display text-3xl leading-[1.3] font-extrabold tracking-tight text-transparent md:text-4xl">
                विंध्यलीडर
              </span>
              <span className="hidden text-[10px] leading-normal tracking-[0.3em] text-neutral-400 md:inline-block">
                VINDHYA LEADER
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
