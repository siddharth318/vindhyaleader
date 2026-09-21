import Link from "next/link";

export default function SectionHeading({
  title,
  href,
  accent = "bg-red-700",
  icon,
}: {
  title: string;
  href: string;
  accent?: string;
  icon?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 border-b border-neutral-200 pb-2">
      <div className="flex items-center gap-2">
        <span className={`h-6 w-1.5 rounded-full ${accent}`} />
        <h2 className="flex items-center gap-1.5 text-lg font-black tracking-tight text-neutral-900 md:text-xl">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="group flex shrink-0 items-center gap-1 text-xs font-bold text-neutral-500 transition-colors hover:text-red-700"
      >
        सभी देखें
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
    </div>
  );
}
