/**
 * Splits sanitized article HTML into chunks so in-article ads can be rendered between them.
 *
 * Placement rules (kept conservative so ads never outweigh the story, per AdSense policy):
 *  - first ad after the 3rd top-level block, then one every 5 blocks, at most MAX_ADS;
 *  - never directly after a heading (it would separate the heading from its text);
 *  - never in the last 2 blocks (the bottom of the article already has its own ad slot).
 * Short stories (or a body that is one giant paragraph) get no in-body ad; the caller can
 * then show one after the body instead.
 */

const MAX_ADS = 3;
const FIRST_AFTER = 3;
const EVERY = 5;
const TAIL = 2;

// Tags without a closing tag in the sanitizer's allow-list (see sanitizeArticleHtml).
const VOID = new Set(["br", "hr", "img", "source", "wbr"]);
const HEADING = /^h[1-6]$/;

/** End offsets of each top-level element, with its tag name. Text outside any tag is ignored. */
function topLevelBlocks(html: string): { end: number; tag: string }[] {
  const blocks: { end: number; tag: string }[] = [];
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  let depth = 0;
  let open = "";
  for (let m; (m = tagRe.exec(html)); ) {
    const [, closing, rawName, selfClosing] = m;
    const name = rawName.toLowerCase();
    if (closing) {
      depth = Math.max(0, depth - 1);
      if (depth === 0) blocks.push({ end: m.index + m[0].length, tag: open || name });
    } else if (VOID.has(name) || selfClosing) {
      if (depth === 0) blocks.push({ end: m.index + m[0].length, tag: name });
    } else {
      if (depth === 0) open = name;
      depth++;
    }
  }
  return blocks;
}

export function splitForInArticleAds(html: string): string[] {
  const blocks = topLevelBlocks(html);
  const cuts: number[] = [];
  let next = FIRST_AFTER;
  for (let i = 0; i < blocks.length - TAIL && cuts.length < MAX_ADS; i++) {
    if (i + 1 < next) continue;
    if (HEADING.test(blocks[i].tag) || blocks[i].tag === "hr") continue; // try the following block
    cuts.push(blocks[i].end);
    next = i + 1 + EVERY;
  }

  const chunks: string[] = [];
  let start = 0;
  for (const cut of cuts) {
    chunks.push(html.slice(start, cut));
    start = cut;
  }
  chunks.push(html.slice(start));
  return chunks;
}
