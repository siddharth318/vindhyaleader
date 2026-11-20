"use client";

import { useEffect, useState } from "react";

export type PopupAd = { id: string; imageUrl: string; linkUrl: string | null; name: string };

/** Element marking the end of the story text; the popup waits until the reader gets there. */
export const POPUP_TRIGGER_ID = "article-end";
const SEEN_KEY = "vl_popup_seen";

/**
 * Popup ad over an article, timed to stay within Google's Better Ads Standards (which AdSense
 * sites are held to): it never interrupts reading. It appears only at a natural break,
 *  - once the reader has scrolled to the end of the story text (#article-end), and
 *  - has been on the page at least `minDelayMs`,
 * and at most once per browser session, so readers moving between stories aren't hit again.
 * Closes with the ✕ button, a click on the backdrop, or Esc.
 *
 * One ad is picked at random from the slot's active ads (up to 3) in the browser, because the
 * article page itself is cached and shared between readers. Desktop (≥1024px) and phones pick
 * from their own list.
 */
export default function AdPopup({
  desktopAds,
  mobileAds,
  minDelayMs = 15000,
}: {
  desktopAds: PopupAd[];
  mobileAds: PopupAd[];
  minDelayMs?: number;
}) {
  const [ad, setAd] = useState<PopupAd | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {
      // storage blocked (private mode etc.) — fall through, still gated on reading to the end
    }
    const end = document.getElementById(POPUP_TRIGGER_ID);
    if (!end) return;

    let timeUp = false;
    let reachedEnd = false;
    const show = () => {
      if (!timeUp || !reachedEnd) return;
      cleanup();
      const list = window.matchMedia("(min-width: 1024px)").matches ? desktopAds : mobileAds;
      if (!list.length) return;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      setAd(list[Math.floor(Math.random() * list.length)]);
    };

    const timer = setTimeout(() => {
      timeUp = true;
      show();
    }, minDelayMs);
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        reachedEnd = true;
        show();
      }
    });
    observer.observe(end);
    function cleanup() {
      clearTimeout(timer);
      observer.disconnect();
    }
    return cleanup;
  }, [minDelayMs, desktopAds, mobileAds]);

  useEffect(() => {
    if (!ad) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAd(null);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [ad]);

  if (!ad) return null;

  return (
    <div
      className="ad-popup-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
      onClick={() => setAd(null)}
      role="dialog"
      aria-modal="true"
      aria-label={ad.name}
    >
      {/* stopPropagation: clicks on the ad itself must not count as "outside" */}
      <div className="ad-popup-card relative w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setAd(null)}
          aria-label="बंद करें"
          autoFocus
          className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-bold leading-none text-neutral-800 shadow-lg ring-1 ring-black/10 transition-transform hover:scale-110"
        >
          ×
        </button>
        <a
          href={ad.linkUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block overflow-hidden rounded-xl shadow-2xl"
        >
          {/* Admin-controlled ad creative: plain <img>, like AdSlot. */}
          <img src={ad.imageUrl} alt={ad.name} data-ad-id={ad.id} className="block h-auto w-full" />
        </a>
      </div>
    </div>
  );
}
