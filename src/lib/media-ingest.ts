import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/storage";

const MAX_FETCH_BYTES = 15 * 1024 * 1024; // 15MB ceiling on a remote image we pull in

/**
 * Re-encodes an image buffer to WebP (strips EXIF/metadata, caps width, keeps a
 * consistent optimized format), stores it, and records a Media row. Shared by
 * the media upload actions and the remote-image rehosting below.
 */
export async function processAndStoreImage(
  buffer: Buffer,
  uploadedById: string,
  altText?: string | null,
  caption?: string | null
) {
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  const image = sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 });
  const outputBuffer = await image.toBuffer();
  const metadata = await sharp(outputBuffer).metadata();
  const url = await saveUpload(outputBuffer, safeName, "image/webp");

  const media = await prisma.media.create({
    data: {
      filename: safeName,
      url,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      altText: altText || null,
      caption: caption || null,
      uploadedById,
    },
  });

  await prisma.auditLog.create({
    data: { userId: uploadedById, action: "UPLOAD", entityType: "Media", entityId: media.id },
  });

  return media;
}

/** Decode the handful of HTML entities that show up inside sanitized img src values. */
function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#38;/g, "&")
    .replace(/&#x26;/gi, "&");
}

/** True for URLs already hosted by us (our blob storage or local /uploads), which must not be re-fetched. */
function isAlreadyHosted(url: string): boolean {
  if (url.startsWith("/uploads/")) return true; // local dev storage (relative)
  try {
    return new URL(url).hostname.endsWith(".blob.core.windows.net");
  } catch {
    return false;
  }
}

/**
 * Rewrites external, hot-linked `<img>` sources in article body HTML to copies
 * hosted in our own Media/blob storage, creating a Media row for each. This is
 * what lets a pasted-in image (e.g. copied from another news site as a remote
 * `<img>`, not a base64 data URI) become a real Media record — so the first
 * body image can be promoted to the article's cover, and so the site never
 * hot-links third-party images. Best-effort: any image we can't fetch is left
 * untouched and the rest of the article still saves.
 */
export async function rehostRemoteImages(bodyHtml: string, uploadedById: string): Promise<string> {
  const tags = bodyHtml.match(/<img\b[^>]*>/gi);
  if (!tags) return bodyHtml;

  let out = bodyHtml;
  const done = new Map<string, string>(); // original src (as in HTML) -> new hosted url

  for (const tag of tags) {
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!src) continue;

    if (done.has(src)) {
      out = out.split(src).join(done.get(src)!);
      continue;
    }

    const decoded = decodeEntities(src);
    if (!/^https?:\/\//i.test(decoded)) continue; // relative/data URIs handled elsewhere
    if (isAlreadyHosted(decoded)) continue;

    // Skip anything we already have a Media record for (e.g. inserted from the library).
    const existing = await prisma.media.findFirst({
      where: { url: { in: Array.from(new Set([src, decoded])) } },
      select: { id: true },
    });
    if (existing) continue;

    try {
      const res = await fetch(decoded, { redirect: "follow" });
      if (!res.ok) continue;
      if (!(res.headers.get("content-type") ?? "").toLowerCase().startsWith("image/")) continue;

      const length = Number(res.headers.get("content-length") ?? "0");
      if (length && length > MAX_FETCH_BYTES) continue;

      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.byteLength > MAX_FETCH_BYTES) continue;

      const alt = tag.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? null;
      const media = await processAndStoreImage(buffer, uploadedById, alt, null);

      done.set(src, media.url);
      out = out.split(src).join(media.url);
    } catch {
      // Unreachable/invalid image — leave the original src in place.
    }
  }

  return out;
}
