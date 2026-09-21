"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { categoryAccent, categoryIcon } from "@/lib/categoryColors";

type Category = {
  id: string;
  slug: string;
  hindiName: string;
  children: { id: string; slug: string; hindiName: string }[];
};

export default function MobileNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <button
        aria-label="मेनू खोलें"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-lg text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 md:hidden"
      >
        ☰
      </button>

      {/* Overlay */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <nav
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[85%] max-w-xs transform flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-orange-600 px-4 py-5">
          <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-4 h-24 w-24 rounded-full bg-black/10" />
          <Link href="/" onClick={() => setOpen(false)} className="relative flex items-center gap-3">
            <LogoMark className="h-12 w-12 shrink-0 ring-2 ring-white/40" instanceId="mobile-drawer" />
            <span className="font-display text-2xl font-extrabold leading-none text-white">विंध्यलीडर</span>
          </Link>
          <button
            aria-label="बंद करें"
            onClick={() => setOpen(false)}
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl leading-none text-white transition-colors hover:bg-white/25"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <form action="/search" method="get" className="flex gap-2 border-b border-neutral-100 px-4 py-3">
          <input
            type="search"
            name="q"
            placeholder="खबर खोजें..."
            className="w-full rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm outline-none focus:border-red-600 focus:bg-white"
          />
          <button
            type="submit"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-700 text-sm text-white"
            aria-label="खोजें"
          >
            🔍
          </button>
        </form>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-neutral-800 transition-colors hover:bg-neutral-50"
          >
            <span className="text-base">🏠</span> होम
          </Link>

          <p className="mb-1 mt-3 px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">श्रेणियाँ</p>

          <ul className="space-y-0.5">
            {categories.map((cat) => {
              const accent = categoryAccent(cat.slug);
              const isExpanded = expanded === cat.id;
              return (
                <li key={cat.id}>
                  <div
                    className={`flex items-center rounded-xl transition-colors ${isExpanded ? accent.bg : "hover:bg-neutral-50"}`}
                  >
                    <Link
                      href={`/${cat.slug}`}
                      onClick={() => setOpen(false)}
                      className={`flex flex-1 items-center gap-3 px-3 py-2.5 text-sm font-semibold ${
                        isExpanded ? accent.text : "text-neutral-700"
                      }`}
                    >
                      <span className="text-base">{categoryIcon(cat.slug)}</span>
                      {cat.hindiName}
                    </Link>
                    {cat.children.length > 0 && (
                      <button
                        aria-label="उप-श्रेणियाँ दिखाएँ"
                        onClick={() => setExpanded(isExpanded ? null : cat.id)}
                        className={`mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs transition-transform ${
                          isExpanded ? `rotate-180 ${accent.text}` : "text-neutral-400"
                        }`}
                      >
                        ▾
                      </button>
                    )}
                  </div>
                  {isExpanded && cat.children.length > 0 && (
                    <ul className="ml-6 space-y-0.5 border-l-2 border-neutral-100 py-1 pl-3">
                      {cat.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/${child.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-red-700"
                          >
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.solid}`} />
                            {child.hindiName}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-3">
          <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-neutral-500">
            <Link href="/contact-us" onClick={() => setOpen(false)} className="hover:text-red-700">
              संपर्क करें
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/privacy-policy" onClick={() => setOpen(false)} className="hover:text-red-700">
              Privacy Policy
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/admin/login" onClick={() => setOpen(false)} className="hover:text-red-700">
              एडमिन लॉगिन
            </Link>
          </div>
          <p className="text-[11px] font-semibold tracking-wide text-neutral-400">आपकी अपनी आवाज़ • विंध्यलीडर</p>
        </div>
      </nav>
    </>
  );
}
