"use client";

import { useEffect } from "react";

/**
 * Records one article view per browser session. Runs on the client (via a
 * POST beacon) so views are counted on every real read — unlike a server-side
 * counter, which the article page's ISR cache would suppress. The per-session
 * guard keeps refreshes from inflating the count.
 */
export default function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    if (!articleId) return;
    const key = `vl_viewed:${articleId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable (private mode) — still count the view.
    }

    const body = JSON.stringify({ articleId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track-view", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track-view", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }, [articleId]);

  return null;
}
