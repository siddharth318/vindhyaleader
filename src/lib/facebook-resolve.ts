import { facebookShareLink, isFacebookHost, isFacebookPluginUrl, parseFacebookVideo, type FacebookEmbed } from "@/lib/video";

/**
 * Server-only: follows a Facebook share link (facebook.com/share/v/…, /share/r/…, fb.watch/…) to the
 * real video/reel address, because Facebook's embedded player can't play share links ("Video
 * unavailable"). Facebook answers simple link-preview clients with a redirect to the video; full
 * browser user-agents get a 400, so we identify as Facebook's own link-preview crawler.
 */
const UA = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
const MAX_HOPS = 5;

export async function resolveFacebookShare(shareUrl: string): Promise<FacebookEmbed | null> {
  let url = shareUrl;
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": UA, accept: "text/html" },
      signal: AbortSignal.timeout(8000),
    });
    const location = res.headers.get("location");

    if (!location) {
      // No redirect: the page itself may name the video in its og:url.
      if (!res.ok) return null;
      const html = (await res.text()).slice(0, 500_000);
      const og = html.match(/property="og:url"\s+content="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&");
      return og ? parseFacebookVideo(og) : null;
    }

    const next = new URL(location, url);
    if (!isFacebookHost(next.hostname)) return null; // never follow a redirect off Facebook
    const direct = parseFacebookVideo(next.toString());
    if (direct) return direct;
    url = next.toString();
  }
  return null;
}

/**
 * Embeds saved before share links were resolved still point the player at a share link. On article
 * save, swap each such iframe for the real video (best-effort: unresolvable ones are left as they are).
 */
export async function fixFacebookShareEmbeds(bodyHtml: string): Promise<string> {
  const tags = bodyHtml.match(/<iframe\b[^>]*>/gi);
  if (!tags) return bodyHtml;

  let out = bodyHtml;
  for (const tag of tags) {
    const src = tag.match(/\bsrc\s*=\s*"([^"]+)"/i)?.[1]?.replace(/&amp;/g, "&");
    if (!src || !isFacebookPluginUrl(src)) continue;
    const share = facebookShareLink(new URL(src).searchParams.get("href") ?? "");
    if (!share) continue;
    try {
      const embed = await resolveFacebookShare(share);
      if (!embed) continue;
      const fixed = tag
        .replace(/\bsrc\s*=\s*"[^"]*"/i, `src="${embed.src.replace(/&/g, "&amp;")}"`)
        .replace(/\bfb-(landscape|portrait)\b/, embed.portrait ? "fb-portrait" : "fb-landscape");
      out = out.split(tag).join(fixed);
    } catch {
      // Facebook unreachable — keep the original embed; the article still saves.
    }
  }
  return out;
}
