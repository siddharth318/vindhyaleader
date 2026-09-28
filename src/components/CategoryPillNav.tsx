"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { categoryAccent, categoryIcon } from "@/lib/categoryColors";

type Category = { id: string; slug: string; hindiName: string };

/**
 * Horizontal category pill bar. On touch devices it scrolls by swipe; on
 * desktop (where there's no horizontal wheel and the scrollbar is hidden) it
 * shows left/right arrow buttons that appear only when there's more to scroll.
 */
export default function CategoryPillNav({ categories }: { categories: Category[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollByDir = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <div className="relative mb-6">
      {/* Left arrow (desktop only) */}
      {canLeft && (
        <>
          <div className="pointer-events-none absolute bottom-2 left-0 top-0 z-[5] hidden w-12 bg-gradient-to-r from-neutral-50 to-transparent [@media(pointer:fine)]:block" />
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            aria-label="पिछली श्रेणियाँ"
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white p-1.5 text-neutral-600 shadow-md transition hover:bg-neutral-100 [@media(pointer:fine)]:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </>
      )}

      <div
        ref={scrollerRef}
        className="flex snap-x gap-2.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((c) => {
          const accent = categoryAccent(c.slug);
          return (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className={`group flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-transparent px-4 py-2 text-xs font-bold whitespace-nowrap shadow-sm ring-1 ring-inset transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-2 active:translate-y-0 ${accent.bg} ${accent.text} ${accent.ringSoft}`}
            >
              <span className="text-sm leading-none">{categoryIcon(c.slug)}</span>
              {c.hindiName}
            </Link>
          );
        })}
      </div>

      {/* Right arrow (desktop only) */}
      {canRight && (
        <>
          <div className="pointer-events-none absolute bottom-2 right-0 top-0 z-[5] hidden w-12 bg-gradient-to-l from-neutral-50 to-transparent [@media(pointer:fine)]:block" />
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            aria-label="अगली श्रेणियाँ"
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white p-1.5 text-neutral-600 shadow-md transition hover:bg-neutral-100 [@media(pointer:fine)]:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
