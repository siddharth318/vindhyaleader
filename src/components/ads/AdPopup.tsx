"use client";

import { useEffect, useState } from "react";

/**
 * Interstitial ad shown over an article after the reader has been on it for `delayMs`.
 * Stays until the reader closes it — ✕ button, a click on the backdrop, or Esc.
 */
export default function AdPopup({
  imageUrl,
  linkUrl,
  name,
  delayMs = 5000,
}: {
  imageUrl: string;
  linkUrl: string | null;
  name: string;
  delayMs?: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="ad-popup-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      {/* stopPropagation: clicks on the ad itself must not count as "outside" */}
      <div className="ad-popup-card relative w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="बंद करें"
          autoFocus
          className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-bold leading-none text-neutral-800 shadow-lg ring-1 ring-black/10 transition-transform hover:scale-110"
        >
          ×
        </button>
        <a
          href={linkUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block overflow-hidden rounded-xl shadow-2xl"
        >
          {/* Admin-controlled ad creative: plain <img>, like AdSlot. */}
          <img src={imageUrl} alt={name} className="block h-auto w-full" />
        </a>
      </div>
    </div>
  );
}
