/**
 * Instant loading skeleton for the homepage (and any route without its own
 * loading.tsx). Shows immediately on navigation — e.g. clicking the logo from
 * an article — while the page's data streams in, so it never looks frozen.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-4" role="status" aria-label="लोड हो रहा है…">
      {/* Category pill row */}
      <div className="mb-6 flex gap-2.5 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 w-24 shrink-0 rounded-full bg-neutral-200" />
        ))}
      </div>

      {/* Hero grid: main story + secondary strip */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="h-[320px] rounded-2xl bg-neutral-200 lg:h-[420px]" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-xl bg-white p-2 ring-1 ring-black/5">
              <div className="h-20 w-24 shrink-0 rounded-lg bg-neutral-200" />
              <div className="flex flex-1 flex-col justify-center gap-2">
                <div className="h-3 w-16 rounded bg-neutral-200" />
                <div className="h-3 w-full rounded bg-neutral-200" />
                <div className="h-3 w-2/3 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest grid */}
      <div className="mb-4 h-6 w-40 rounded bg-neutral-200" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl ring-1 ring-black/5">
            <div className="aspect-[4/3] w-full bg-neutral-200" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-20 rounded bg-neutral-200" />
              <div className="h-4 w-full rounded bg-neutral-200" />
              <div className="h-4 w-2/3 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">लोड हो रहा है…</span>
    </div>
  );
}
