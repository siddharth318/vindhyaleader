import sharp from "sharp";
import { SITE_URL } from "@/lib/seo";
import type { AdSize } from "@/lib/ad-sizes";

const MAX_FETCH_BYTES = 15 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;

/** Pixel size of an image buffer as displayed (honours EXIF rotation; first frame of a GIF). */
export async function measureImage(buffer: Buffer): Promise<AdSize> {
  const m = await sharp(buffer).metadata();
  let w = m.width ?? 0;
  let h = m.pageHeight ?? m.height ?? 0;
  if (m.orientation && m.orientation >= 5) [w, h] = [h, w]; // 90°/270° orientations swap the axes
  if (!w || !h) throw new Error("unreadable image");
  return { w, h };
}

/**
 * Downloads an image from `url` (absolute, or a site-relative path) so its size can be checked.
 * Throws a Hindi-message Error if it can't be fetched or isn't an image.
 */
export async function fetchImageBuffer(url: string): Promise<Buffer> {
  let target: URL;
  try {
    target = new URL(url, SITE_URL);
  } catch {
    throw new Error("इमेज URL सही नहीं है।");
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") throw new Error("इमेज URL http/https वाला होना चाहिए।");

  let res: Response;
  try {
    res = await fetch(target, { redirect: "follow", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch {
    throw new Error("इमेज URL खुल नहीं रही — लिंक जाँचें, या इमेज सीधे अपलोड करें।");
  }
  if (!res.ok) throw new Error(`इमेज URL खुल नहीं रही (त्रुटि ${res.status}) — लिंक जाँचें, या इमेज सीधे अपलोड करें।`);
  if (!(res.headers.get("content-type") ?? "").toLowerCase().startsWith("image/")) {
    throw new Error("यह URL किसी इमेज का नहीं है।");
  }
  const length = Number(res.headers.get("content-length") ?? "0");
  if (length > MAX_FETCH_BYTES) throw new Error("इमेज बहुत बड़ी है।");

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_FETCH_BYTES) throw new Error("इमेज बहुत बड़ी है।");
  return buffer;
}
