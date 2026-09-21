import sanitizeHtml from "sanitize-html";

/**
 * Allow-list sanitizer for admin-authored article body HTML (from the Tiptap editor).
 * Applied both on save and defensively on render.
 */
export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "blockquote", "ul", "ol", "li",
      "h2", "h3", "h4", "a", "img", "figure", "figcaption", "hr", "table",
      "thead", "tbody", "tr", "th", "td", "iframe", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder"],
      span: ["class"],
      "*": ["class"],
    },
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "player.vimeo.com"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
  });
}
