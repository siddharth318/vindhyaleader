import sanitizeHtml from "sanitize-html";
import { isFacebookPluginUrl, isOurVideoUrl } from "@/lib/video";

/**
 * Allow-list sanitizer for admin-authored article body HTML (from the Tiptap editor).
 * Applied both on save and defensively on render.
 */
export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "blockquote", "ul", "ol", "li",
      "h2", "h3", "h4", "a", "img", "figure", "figcaption", "hr", "table",
      "thead", "tbody", "tr", "th", "td", "iframe", "span", "video",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "loading", "title", "scrolling"],
      video: ["src", "controls", "preload", "playsinline", "width", "height"],
      span: ["class"],
      "*": ["class"],
    },
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "player.vimeo.com", "www.facebook.com"],
    // Videos: only files we host ourselves (our blob storage / local uploads) may be played, and the
    // only Facebook iframe allowed is its video player. Anything else is dropped entirely.
    exclusiveFilter: (frame) => {
      const src = frame.attribs.src ?? "";
      if (frame.tag === "video") return !isOurVideoUrl(src);
      if (frame.tag === "iframe") return !src || (/facebook\.com/i.test(src) && !isFacebookPluginUrl(src));
      return false;
    },
    // Same non-breaking-space problem as cleanText(), inside body paragraphs.
    textFilter: (text) => text.replace(ODD_SPACES, " ").replace(ZERO_WIDTH, ""),
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
  });
}

// Non-breaking / fixed-width spaces and zero-width chars that text pasted from
// Word/WhatsApp often carries. (ZWJ/ZWNJ are deliberately kept: Devanagari needs them.)
const ODD_SPACES = /[\u00A0\u2000-\u200A\u202F\u3000]/g;
const ZERO_WIDTH = /[\u200B\uFEFF]/g;

/**
 * Normalise plain-text fields (titles, excerpts). Non-breaking spaces turn a whole
 * headline into one unbreakable "word" that can't wrap and blows out the layout.
 */
export function cleanText(input: string): string {
  return input.replace(ODD_SPACES, " ").replace(ZERO_WIDTH, "").replace(/\s+/g, " ").trim();
}
