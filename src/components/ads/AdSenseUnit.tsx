"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * One Google AdSense in-article (fluid) unit. The adsbygoogle.js loader itself is in the
 * root layout; this just asks it to fill the <ins>. The whole block hides itself when Google
 * has no ad to show (see .adsense-unit in globals.css), so no empty gap is left in the story.
 */
export default function AdSenseUnit({ client, slot, className = "" }: { client: string; slot: string; className?: string }) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const ins = insRef.current;
    // Guard against a second push for the same <ins> (React Strict Mode runs effects twice in dev).
    if (!ins || ins.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers / script not loaded yet — leave the slot empty.
    }
  }, []);

  return (
    <aside className={`adsense-unit not-prose my-6 ${className}`} aria-label="विज्ञापन">
      {/* AdSense allows "Advertisement"-style labels; it must not invite clicks. */}
      <span className="mb-1 block text-center text-[10px] uppercase tracking-wide text-neutral-400">विज्ञापन</span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={client}
        data-ad-slot={slot}
      />
    </aside>
  );
}
