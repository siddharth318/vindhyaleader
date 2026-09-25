import type { SeriesPoint } from "@/lib/data/analytics";

/**
 * Lightweight, dependency-free bar chart for the admin analytics screens.
 * Renders CSS-height bars (responsive, no canvas/SVG lib), with a hover tooltip
 * per bar and sparse x-axis labels supplied by the data.
 */
export default function BarChart({
  data,
  height = 180,
  barClassName = "bg-red-500 group-hover:bg-red-600",
  unit = "views",
}: {
  data: SeriesPoint[];
  height?: number;
  barClassName?: string;
  unit?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {data.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.label || d.key}: ${d.value.toLocaleString("en-IN")} ${unit}`}>
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                {d.value.toLocaleString("en-IN")} {unit}
              </div>
              <div
                className={`w-full rounded-t transition-colors ${d.value === 0 ? "bg-neutral-200" : barClassName}`}
                style={{ height: d.value === 0 ? "2px" : `${Math.max(pct, 3)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-[3px] text-[10px] text-neutral-400">
        {data.map((d) => (
          <div key={d.key} className="flex-1 truncate text-center">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
