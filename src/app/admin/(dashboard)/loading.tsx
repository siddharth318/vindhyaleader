import Spinner from "@/components/Spinner";

/** Shown while navigating between admin dashboard pages so the panel never looks frozen. */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="लोड हो रहा है…">
      <div className="flex items-center gap-3 text-neutral-500">
        <Spinner className="h-6 w-6 text-red-700" />
        <span className="text-sm font-medium">लोड हो रहा है…</span>
      </div>
    </div>
  );
}
