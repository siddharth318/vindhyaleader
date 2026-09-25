/** Instant loading skeleton for a category listing page. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-6" role="status" aria-label="खबरें लोड हो रही हैं…">
      <div className="mb-3 h-3 w-40 rounded bg-neutral-200" />
      <div className="mb-6 h-8 w-56 rounded bg-neutral-200" />
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
      <span className="sr-only">खबरें लोड हो रही हैं…</span>
    </div>
  );
}
