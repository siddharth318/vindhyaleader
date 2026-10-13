"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Mobile (< md) admin menu: a ☰ button that opens the sidebar navigation (passed in as
 * children, rendered on the server) in a slide-in drawer. Closes when a menu link is tapped,
 * on a tap outside the drawer, or on Esc.
 */
export default function AdminMobileNav({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-md text-xl text-neutral-800 hover:bg-neutral-100"
      >
        ☰
      </button>

      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85%] flex-col bg-neutral-900 text-neutral-200 shadow-2xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin menu"
        inert={!open}
        // Tapping any link inside navigates away, so close the drawer with it.
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute right-2 top-3 flex h-8 w-8 items-center justify-center rounded-md text-xl text-neutral-400 hover:bg-neutral-800 hover:text-white"
        >
          ×
        </button>
        {children}
      </aside>
    </>
  );
}
