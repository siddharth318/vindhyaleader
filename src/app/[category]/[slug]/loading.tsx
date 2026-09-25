/** Instant loading skeleton shown while a news article streams in (replaces the frozen wait). */
export default function Loading() {
  return (
    <div
      className="mx-auto max-w-3xl animate-pulse px-4 py-6"
      role="status"
      aria-label="खबर लोड हो रही है…"
    >
      {/* breadcrumb */}
      <div className="mb-3 h-3 w-40 rounded bg-neutral-200" />
      {/* category chip */}
      <div className="mb-3 h-5 w-24 rounded bg-neutral-200" />
      {/* title */}
      <div className="mb-2 h-8 w-full rounded bg-neutral-200" />
      <div className="mb-4 h-8 w-3/4 rounded bg-neutral-200" />
      {/* meta row */}
      <div className="mb-5 flex gap-3">
        <div className="h-4 w-28 rounded bg-neutral-200" />
        <div className="h-4 w-24 rounded bg-neutral-200" />
      </div>
      {/* hero image */}
      <div className="mb-6 aspect-[16/9] w-full rounded-md bg-neutral-200" />
      {/* body paragraphs */}
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`h-4 rounded bg-neutral-200 ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
      <span className="sr-only">खबर लोड हो रही है…</span>
    </div>
  );
}
