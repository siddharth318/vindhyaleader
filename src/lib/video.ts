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

/** Canonicalise a Facebook video URL; null when it isn't a link to a single video/reel. */
function canonicalFacebookVideo(url: URL): { canonical: string; portrait: boolean } | null {
  const host = url.hostname.toLowerCase();
  if (host === "fb.watch") {
    const code = url.pathname.split("/").filter(Boolean)[0];
    return code && /^[\w-]+$/.test(code) ? { canonical: `https://fb.watch/${code}/`, portrait: false } : null;
  }

  const path = url.pathname.replace(/\/+$/, "");
  const parts = path.split("/").filter(Boolean);

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
  // https://www.facebook.com/share/v/AbC123/  (video)  |  /share/r/AbC123/  (reel)
  if (parts[0] === "share" && (parts[1] === "v" || parts[1] === "r") && parts[2] && /^[\w-]+$/.test(parts[2])) {
    return { canonical: `https://www.facebook.com/share/${parts[1]}/${parts[2]}/`, portrait: parts[1] === "r" };
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

/**
 * Turns whatever the editor pasted — a Facebook video link, a reel link, an fb.watch short link,
 * or Facebook's own "Embed" <iframe> code — into the iframe URL used to show it. Null if it isn't
 * a recognisable Facebook video.
 */
export function parseFacebookVideo(input: string): FacebookEmbed | null {
  return parse(input.trim(), true);
}

function parse(text: string, allowPlugin: boolean): FacebookEmbed | null {
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
  if (!FB_HOSTS.has(url.hostname.toLowerCase())) return null;

  // The embed code from Facebook's own Share → Embed dialog: unwrap its href=<video URL>.
  if (url.pathname.replace(/\/+$/, "") === "/plugins/video.php") {
    const href = url.searchParams.get("href");
    return allowPlugin && href ? parse(href, false) : null;
  }

  const found = canonicalFacebookVideo(url);
  return found ? { src: pluginUrl(found.canonical, found.portrait), portrait: found.portrait } : null;
}
