"use client";

import { useState } from "react";

/** One-tap "copy this image's URL" — for pasting into the ad form's image URL field. */
export default function CopyUrlButton({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    // Local-dev uploads are stored as "/uploads/…"; make them absolute so they paste anywhere.
    const full = url.startsWith("/") ? `${window.location.origin}${url}` : url;
    try {
      await navigator.clipboard.writeText(full);
      setState("copied");
    } catch {
      // Clipboard API needs https and a user gesture; fall back to a temporary textarea.
      const ta = document.createElement("textarea");
      ta.value = full;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      setState(ok ? "copied" : "failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-neutral-100 px-2 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-200"
    >
      {state === "copied" ? "✅ कॉपी हो गया" : state === "failed" ? "❌ कॉपी नहीं हुआ" : "📋 URL कॉपी करें"}
    </button>
  );
}
