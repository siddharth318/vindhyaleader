/** Accent color per category slug — gives each section/badge a distinct identity at a glance. */
const PALETTE: Record<string, { bg: string; text: string; solid: string; ring: string; ringSoft: string }> = {
  national: { bg: "bg-red-50", text: "text-red-700", solid: "bg-red-700", ring: "ring-red-700", ringSoft: "ring-red-700/20" },
  international: { bg: "bg-slate-50", text: "text-slate-700", solid: "bg-slate-700", ring: "ring-slate-700", ringSoft: "ring-slate-700/20" },
  "uttar-pradesh": { bg: "bg-orange-50", text: "text-orange-700", solid: "bg-orange-600", ring: "ring-orange-600", ringSoft: "ring-orange-600/20" },
  politics: { bg: "bg-blue-50", text: "text-blue-700", solid: "bg-blue-700", ring: "ring-blue-700", ringSoft: "ring-blue-700/20" },
  crime: { bg: "bg-rose-50", text: "text-rose-700", solid: "bg-rose-800", ring: "ring-rose-800", ringSoft: "ring-rose-800/20" },
  sports: { bg: "bg-emerald-50", text: "text-emerald-700", solid: "bg-emerald-600", ring: "ring-emerald-600", ringSoft: "ring-emerald-600/20" },
  entertainment: { bg: "bg-pink-50", text: "text-pink-700", solid: "bg-pink-600", ring: "ring-pink-600", ringSoft: "ring-pink-600/20" },
  business: { bg: "bg-amber-50", text: "text-amber-700", solid: "bg-amber-600", ring: "ring-amber-600", ringSoft: "ring-amber-600/20" },
  education: { bg: "bg-violet-50", text: "text-violet-700", solid: "bg-violet-700", ring: "ring-violet-700", ringSoft: "ring-violet-700/20" },
  health: { bg: "bg-teal-50", text: "text-teal-700", solid: "bg-teal-600", ring: "ring-teal-600", ringSoft: "ring-teal-600/20" },
  technology: { bg: "bg-indigo-50", text: "text-indigo-700", solid: "bg-indigo-600", ring: "ring-indigo-600", ringSoft: "ring-indigo-600/20" },
  dharma: { bg: "bg-orange-50", text: "text-orange-800", solid: "bg-orange-700", ring: "ring-orange-700", ringSoft: "ring-orange-700/20" },
  rashifal: { bg: "bg-fuchsia-50", text: "text-fuchsia-700", solid: "bg-fuchsia-700", ring: "ring-fuchsia-700", ringSoft: "ring-fuchsia-700/20" },
  "apna-jila": { bg: "bg-emerald-50", text: "text-emerald-800", solid: "bg-emerald-700", ring: "ring-emerald-700", ringSoft: "ring-emerald-700/20" },
  sonbhadra: { bg: "bg-emerald-50", text: "text-emerald-800", solid: "bg-emerald-700", ring: "ring-emerald-700", ringSoft: "ring-emerald-700/20" },
  mirzapur: { bg: "bg-cyan-50", text: "text-cyan-800", solid: "bg-cyan-700", ring: "ring-cyan-700", ringSoft: "ring-cyan-700/20" },
  varanasi: { bg: "bg-yellow-50", text: "text-yellow-800", solid: "bg-yellow-700", ring: "ring-yellow-700", ringSoft: "ring-yellow-700/20" },
};

const DEFAULT = {
  bg: "bg-red-50",
  text: "text-red-700",
  solid: "bg-red-700",
  ring: "ring-red-700",
  ringSoft: "ring-red-700/20",
};

export function categoryAccent(slug: string) {
  return PALETTE[slug] ?? DEFAULT;
}

/** Small emoji glyph per category — used in pill nav / mobile drawer for quick visual scanning. */
const ICONS: Record<string, string> = {
  national: "📰",
  international: "🌍",
  "uttar-pradesh": "🏛️",
  politics: "🗳️",
  crime: "🚨",
  sports: "⚽",
  entertainment: "🎬",
  business: "💼",
  education: "📚",
  health: "🩺",
  technology: "💻",
  dharma: "🕉️",
  rashifal: "🔮",
  "apna-jila": "📍",
  sonbhadra: "📍",
  mirzapur: "📍",
  varanasi: "📍",
  chandauli: "📍",
  ghazipur: "📍",
};

export function categoryIcon(slug: string) {
  return ICONS[slug] ?? "📰";
}

