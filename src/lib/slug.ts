import slugifyLib from "slugify";
import { transliterate } from "@/lib/transliterate";

/** Hindi/English filler words dropped from slugs so URLs stay short and keyword-dense. */
const STOPWORDS = new Set([
  "ko", "ne", "ki", "ka", "ke", "me", "men", "mein", "se", "par", "aur", "hai", "hain",
  "tha", "thi", "the", "bhi", "to", "ek", "is", "us", "yah", "vah", "ye", "vo",
  "a", "an", "of", "in", "on", "for", "and", "or", "at", "by", "with",
]);

const MAX_SLUG_LENGTH = 70;

/**
 * Generate a URL-safe, readable slug. Devanagari is transliterated to Latin
 * first (previously it was stripped entirely, leaving an empty slug), filler
 * words are dropped, and the result is capped at a word boundary.
 */
export function slugify(input: string): string {
  // Turn punctuation into spaces first so "घोटाला,शामिल" becomes two words, not one.
  const spaced = transliterate(input).replace(/[^\p{L}\p{N}\s-]/gu, " ");
  const base = slugifyLib(spaced, { lower: true, strict: true, trim: true });
  if (!base) return "";

  const words = base.split("-").filter(Boolean);
  const meaningful = words.filter((w) => !STOPWORDS.has(w));
  const chosen = meaningful.length > 0 ? meaningful : words;

  let slug = "";
  for (const w of chosen) {
    const candidate = slug ? `${slug}-${w}` : w;
    if (candidate.length > MAX_SLUG_LENGTH) break;
    slug = candidate;
  }
  return slug || chosen[0].slice(0, MAX_SLUG_LENGTH);
}

export function uniqueSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

/** True for the placeholder slugs generated before transliteration existed (e.g. "article-uc5tf", "28"). */
export function isPlaceholderSlug(slug: string): boolean {
  return /^article-[a-z0-9]{5}$/.test(slug) || /^\d+$/.test(slug);
}
