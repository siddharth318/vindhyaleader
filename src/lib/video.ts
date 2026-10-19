/**
 * Video helpers shared by the browser (editor / uploader) and the server (sanitizer / upload route).
 * No Node-only imports here.
 */

// ---------- Uploaded video files ----------

/** Videos are uploaded in chunks of this size (kept well under proxy/body limits). */
export const VIDEO_CHUNK_BYTES = 4 * 1024 * 1024;
/** Hard cap on one video: 50 chunks × 4 MB. */
export const VIDEO_MAX_CHUNKS = 50;
export const VIDEO_MAX_BYTES = VIDEO_CHUNK_BYTES * VIDEO_MAX_CHUNKS;

export const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const EXT_TO_TYPE: Record<string, string> = { mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime" };

/** The accepted MIME type for a picked file (falls back to the extension, as phones often send ""), or null. */
export function videoTypeFor(file: { name: string; type: string }): string | null {
  if (VIDEO_TYPES[file.type]) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_TYPE[ext] ?? null;
}

/**
 * True for a video file URL we host ourselves: our blob storage, or the local dev /uploads folder.
 * The article sanitizer only lets <video> point at these, so a story can't embed arbitrary files.
 */
export function isOurVideoUrl(src: string): boolean {
  if (/^\/uploads\/[\w.-]+\.(mp4|webm|mov)$/i.test(src)) return true;
  try {
    const u = new URL(src);
    return u.protocol === "https:" && u.hostname.endsWith(".blob.core.windows.net") && /\.(mp4|webm|mov)$/i.test(u.pathname);
  } catch {
    return false;
  }
}

// ---------- Facebook videos ----------

export type FacebookEmbed = {
  /** The facebook.com/plugins/video.php URL to put in an <iframe>. */
  src: string;
  /** Vertical video (Reels) — shown in a tall 9:16 frame instead of 16:9. */
  portrait: boolean;
};

const FB_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "mbasic.facebook.com",
  "fb.watch",
]);

export function isFacebookHost(hostname: string): boolean {
  return FB_HOSTS.has(hostname.toLowerCase());
}

/** True for a Facebook video-plugin iframe URL (the only Facebook iframe the sanitizer allows). */
export function isFacebookPluginUrl(src: string): boolean {
  try {
    const u = new URL(src);
    return (
      u.protocol === "https:" &&
      (u.hostname === "www.facebook.com" || u.hostname === "facebook.com") &&
      u.pathname.replace(/\/+$/, "") === "/plugins/video.php" &&
      !!u.searchParams.get("href")
    );
  } catch {
    return false;
  }
}

function pluginUrl(canonical: string, portrait: boolean): string {
  const [w, h] = portrait ? [315, 560] : [560, 315];
  return (
    "https://www.facebook.com/plugins/video.php" +
    `?height=${h}&href=${encodeURIComponent(canonical)}&show_text=false&width=${w}&t=0`
  );
}

/**
 * Canonicalise a direct Facebook video URL; null when it isn't a link to a single video/reel.
 * Share links (facebook.com/share/…, fb.watch/…) are NOT direct: Facebook's player shows "Video
 * unavailable" for them, so they must be followed to the real video first (see facebookShareLink).
 */
function canonicalFacebookVideo(url: URL): { canonical: string; portrait: boolean } | null {
  if (url.hostname.toLowerCase() === "fb.watch") return null;
  const parts = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);

  // https://www.facebook.com/watch/?v=123   (also /watch?v=123)
  if (parts[0] === "watch") {
    const v = url.searchParams.get("v");
    return v && /^\d+$/.test(v) ? { canonical: `https://www.facebook.com/watch/?v=${v}`, portrait: false } : null;
  }
  // https://www.facebook.com/video.php?v=123
  if (parts[0] === "video.php") {
    const v = url.searchParams.get("v");
    return v && /^\d+$/.test(v) ? { canonical: `https://www.facebook.com/video.php?v=${v}`, portrait: false } : null;
  }
  // https://www.facebook.com/reel/123
  if ((parts[0] === "reel" || parts[0] === "reels") && parts[1] && /^\d+$/.test(parts[1])) {
    return { canonical: `https://www.facebook.com/reel/${parts[1]}`, portrait: true };
  }
  // https://www.facebook.com/PageName/videos/123/  (also /PageName/videos/some-title/123/  and /videos/123/)
  const vi = parts.indexOf("videos");
  if (vi !== -1 && vi < parts.length - 1 && parts.slice(vi + 1).every((p) => /^[\w%.-]+$/.test(p))) {
    const rest = parts.slice(vi + 1);
    if (/^\d+$/.test(rest[rest.length - 1])) {
      return { canonical: `https://www.facebook.com/${parts.slice(0, vi + 1).concat(rest).join("/")}/`, portrait: false };
    }
  }
  return null;
}

type Classified = { kind: "video"; embed: FacebookEmbed } | { kind: "share"; url: string } | null;

/** What a pasted Facebook link/embed code is: a direct video, a share link to follow, or neither. */
function classify(text: string, allowPlugin = true): Classified {
  text = text.trim();
  const iframeSrc = text.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i)?.[1];
  if (iframeSrc) text = iframeSrc.replace(/&amp;/g, "&");
  if (!text) return null;

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    try {
      url = new URL(`https://${text}`); // "facebook.com/..." typed without the scheme
    } catch {
      return null;
    }
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  if (!FB_HOSTS.has(host)) return null;

  // The embed code from Facebook's own Share → Embed dialog: unwrap its href=<video URL>.
  if (url.pathname.replace(/\/+$/, "") === "/plugins/video.php") {
    const href = url.searchParams.get("href");
    return allowPlugin && href ? classify(href, false) : null;
  }

  // Share links: fb.watch/<code>, facebook.com/share/v/<code>, /share/r/<code>, /share/<code>
  const parts = url.pathname.split("/").filter(Boolean);
  const isShare =
    host === "fb.watch"
      ? parts.length === 1 && /^[\w-]+$/.test(parts[0])
      : parts[0] === "share" && parts.length >= 2 && parts.length <= 3 && parts.every((p) => /^[\w-]+$/.test(p));
  if (isShare) return { kind: "share", url: `https://${host === "fb.watch" ? "fb.watch" : "www.facebook.com"}/${parts.join("/")}/` };

  const found = canonicalFacebookVideo(url);
  return found ? { kind: "video", embed: { src: pluginUrl(found.canonical, found.portrait), portrait: found.portrait } } : null;
}

/**
 * Turns a direct Facebook video/reel link — or Facebook's own "Embed" <iframe> code for one — into
 * the iframe URL used to show it. Null for anything else, including share links (see below).
 */
export function parseFacebookVideo(input: string): FacebookEmbed | null {
  const c = classify(input);
  return c?.kind === "video" ? c.embed : null;
}

/**
 * The normalised share link if `input` is a Facebook share link (what "Share → Copy link" gives,
 * or fb.watch). These must be followed on the server (resolveFacebookShare) before embedding.
 */
export function facebookShareLink(input: string): string | null {
  const c = classify(input);
  return c?.kind === "share" ? c.url : null;
}
