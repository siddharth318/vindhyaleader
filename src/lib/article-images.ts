/**
 * Returns the `src` URL of the first `<img>` in article body HTML, or `null`
 * when the body contains no image.
 *
 * This is what drives "the first image in the body automatically becomes the
 * cover image": `.match()` (no /g flag) returns the first occurrence, so when
 * an article has several images in the body, the earliest one wins.
 */
export function firstBodyImageUrl(bodyHtml: string): string | null {
  const match = bodyHtml.match(/<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/**
 * Removes the first `<img>` in the body **only if** its src matches `url`. Used
 * on the article page to avoid showing the cover image twice: when the cover
 * was auto-derived from the body's first image, that first image is dropped
 * from the rendered body. If the cover is a different image (e.g. uploaded from
 * the device), the first body image doesn't match and stays in place.
 */
export function removeFirstImageByUrl(bodyHtml: string, url: string): string {
  if (!url) return bodyHtml;
  return bodyHtml.replace(/<img\b[^>]*>/i, (tag) => {
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!src) return tag;
    const decoded = src.replace(/&amp;/g, "&");
    return src === url || decoded === url ? "" : tag;
  });
}
