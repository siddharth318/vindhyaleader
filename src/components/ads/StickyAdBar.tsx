"use client";

import { useEffect, useState } from "react";

/** Wraps sticky ad slots with a dismiss control + per-session frequency cap. */
export default function StickyAdBar({
  slotKey,
  children,
}: {
  slotKey: string;
  children: React.ReactNode;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const key = `vl_ad_dismissed_${slotKey}`;
    setDismissed(sessionStorage.getItem(key) === "1");
  }, [slotKey]);

  if (dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center border-t border-neutral-200 bg-white/95 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] backdrop-blur">
      <button
        aria-label="विज्ञापन बंद करें"
        onClick={() => {
          sessionStorage.setItem(`vl_ad_dismissed_${slotKey}`, "1");
          setDismissed(true);
        }}
        className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-xs text-white"
      >
        ✕
      </button>
      <div className="w-full max-w-full overflow-hidden">{children}</div>
    </div>
  );
}
