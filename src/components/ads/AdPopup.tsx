"use client";

import { useEffect, useState } from "react";

export type PopupAd = { id: string; imageUrl: string; linkUrl: string | null; name: string };

/**
 * Interstitial ad shown over an article after the reader has been on it for `delayMs`.
 * One ad is picked at random from the slot's active ads (up to 3) — in the browser, per visit,
 * because the article page itself is cached and shared between readers. Desktop (≥1024px) and
 * phones pick from their own list. Stays until closed: ✕ button, a click on the backdrop, or Esc.
 */
export default function AdPopup({
  desktopAds,
  mobileAds,
  delayMs = 5000,
}: {
  desktopAds: PopupAd[];
  mobileAds: PopupAd[];
  delayMs?: number;
}) {
  const [ad, setAd] = useState<PopupAd | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      const list = window.matchMedia("(min-width: 1024px)").matches ? desktopAds : mobileAds;
      if (list.length) setAd(list[Math.floor(Math.random() * list.length)]);
    }, delayMs);
    return () => clearTimeout(id);
  }, [delayMs, desktopAds, mobileAds]);

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
