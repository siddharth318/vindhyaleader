import slugifyLib from "slugify";

/** Generate a URL-safe slug from a (typically English/transliterated) title. */
export function slugify(input: string): string {
  return slugifyLib(input, { lower: true, strict: true, trim: true });
}

export function uniqueSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}
