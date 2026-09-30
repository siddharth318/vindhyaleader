import type { Metadata } from "next";

/**
 * Central SEO configuration for विंध्यलीडर.
 *
 * Positioning: a regional Hindi news portal published from Robertsganj
 * (Sonbhadra district, Uttar Pradesh) covering Sonbhadra's towns and the wider
 * Purvanchal region. Every page derives its titles, descriptions, keywords and
 * structured data from here, so editors never have to hand-enter regional
 * keywords per article — they're inferred from the category, location and text.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE = {
  nameHi: "विंध्यलीडर",
  nameEn: "Vindhya Leader",
  alternateNames: ["Vindhya Leader", "Vindhyaleader", "VindhyaLeader", "विंध्य लीडर"],
  slogan: "आपकी अपनी आवाज़",
  locale: "hi_IN",
  language: "hi-IN",
  address: {
    streetAddress: "राबर्ट्सगंज",
    addressLocality: "Robertsganj",
    addressRegion: "Uttar Pradesh",
    postalCode: "231216",
    addressCountry: "IN",
  },
  geo: { latitude: 24.688, longitude: 83.068 },
} as const;

export const LOGO_PATH = "/logo.png";
export const DEFAULT_OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Vindhya Leader — Sonbhadra, Robertsganj & Purvanchal News",
};

type Place = { hi: string; en: string; aliases?: string[] };
export type Region = Place & { slug: string; towns: Place[] };

/**
 * Districts we cover (keyed by their category slug) with their main towns.
 * Used to build district-page SEO and to auto-detect an article's location.
 */
export const REGIONS: Region[] = [
  {
    slug: "sonbhadra",
    hi: "सोनभद्र",
    en: "Sonbhadra",
    towns: [
      { hi: "राबर्ट्सगंज", en: "Robertsganj", aliases: ["रॉबर्ट्सगंज", "रावर्ट्सगंज"] },
      { hi: "ओबरा", en: "Obra" },
      { hi: "रेणुकूट", en: "Renukoot", aliases: ["रेनुकूट"] },
      { hi: "पिपरी", en: "Pipri" },
      { hi: "अनपरा", en: "Anpara" },
      { hi: "चोपन", en: "Chopan" },
      { hi: "दुद्धी", en: "Duddhi" },
      { hi: "घोरावल", en: "Ghorawal" },
      { hi: "शक्तिनगर", en: "Shaktinagar" },
      { hi: "म्योरपुर", en: "Myorpur" },
      { hi: "बभनी", en: "Babhani" },
      { hi: "चुर्क", en: "Churk" },
    ],
  },
  {
    slug: "mirzapur",
    hi: "मिर्जापुर",
    en: "Mirzapur",
    aliases: ["मिर्ज़ापुर"],
    towns: [
      { hi: "चुनार", en: "Chunar" },
      { hi: "विंध्याचल", en: "Vindhyachal" },
      { hi: "मड़िहान", en: "Madihan" },
      { hi: "हलिया", en: "Haliya" },
    ],
  },
  {
    slug: "varanasi",
    hi: "वाराणसी",
    en: "Varanasi",
    aliases: ["बनारस", "काशी"],
    towns: [
      { hi: "पिंडरा", en: "Pindra" },
      { hi: "राजातालाब", en: "Rajatalab" },
    ],
  },
  {
    slug: "chandauli",
    hi: "चंदौली",
    en: "Chandauli",
    towns: [
      { hi: "मुगलसराय", en: "Mughalsarai", aliases: ["मुग़लसराय"] },
      { hi: "चकिया", en: "Chakia" },
      { hi: "सकलडीहा", en: "Sakaldiha" },
      { hi: "नौगढ़", en: "Naugarh" },
    ],
  },
  {
    slug: "ghazipur",
    hi: "गाजीपुर",
    en: "Ghazipur",
    aliases: ["ग़ाज़ीपुर", "गाज़ीपुर"],
    towns: [
      { hi: "मोहम्मदाबाद", en: "Mohammadabad" },
      { hi: "सैदपुर", en: "Saidpur" },
      { hi: "ज़मानिया", en: "Zamania", aliases: ["जमानिया"] },
    ],
  },
];

export const PARENT_DISTRICT_SLUG = "apna-jila";

const SONBHADRA = REGIONS[0];

/** Site-wide keywords (Hindi first — the primary audience — then English). */
export const SITE_KEYWORDS: string[] = [
  "विंध्यलीडर",
  "विंध्य लीडर",
  "सोनभद्र न्यूज़",
  "सोनभद्र समाचार",
  "सोनभद्र की ताज़ा खबर",
  "सोनभद्र ब्रेकिंग न्यूज़",
  "आज की खबर सोनभद्र",
  "राबर्ट्सगंज न्यूज़",
  "राबर्ट्सगंज समाचार",
  "राबर्ट्सगंज अखबार",
  "पूर्वांचल न्यूज़",
  "पूर्वांचल समाचार",
  "पूर्वांचल की ताज़ा खबरें",
  "उत्तर प्रदेश समाचार",
  "हिंदी न्यूज़",
  ...SONBHADRA.towns.slice(1, 7).map((t) => `${t.hi} न्यूज़`),
  "Vindhya Leader",
  "Vindhyaleader",
  "Sonbhadra News",
  "Sonbhadra News Today",
  "Sonbhadra Latest News",
  "Sonbhadra Breaking News",
  "Sonbhadra Hindi News",
  "Robertsganj News",
  "Robertsganj Newspaper",
  "Newspaper in Robertsganj",
  "Purvanchal News",
  "Purvanchal Hindi News",
  "UP News in Hindi",
  ...REGIONS.slice(1).map((r) => `${r.en} News`),
];

export const HOME_TITLE = "विंध्यलीडर | Sonbhadra News – सोनभद्र, राबर्ट्सगंज व पूर्वांचल की ताज़ा खबरें";
export const HOME_DESCRIPTION =
  "सोनभद्र के राबर्ट्सगंज से प्रकाशित विंध्यलीडर (Vindhya Leader) — सोनभद्र, मिर्जापुर, वाराणसी, चंदौली, गाजीपुर व पूरे पूर्वांचल की ताज़ा और ब्रेकिंग हिंदी खबरें। Latest Sonbhadra & Robertsganj news.";

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

/** Strip HTML to plain, whitespace-collapsed text. */
export function plainText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Trim text to ~`max` chars at a word boundary, for meta descriptions. */
export function summarize(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,।:;-]+$/, "")}…`;
}

function unique(list: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const v = item?.trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Region detection
// ---------------------------------------------------------------------------

export type RegionMatch = { region: Region; town?: Place };

function mentions(text: string, place: Place): boolean {
  const names = [place.hi, place.en, ...(place.aliases ?? [])];
  return names.some((n) => (/^[a-z]/i.test(n) ? new RegExp(`\\b${n}\\b`, "i").test(text) : text.includes(n)));
}

/**
 * Finds which covered districts/towns an article is about, from its category,
 * location field and text. Town matches imply their district.
 */
export function detectRegions(opts: { categorySlug?: string; location?: string | null; text?: string }): RegionMatch[] {
  const haystack = `${opts.location ?? ""} ${opts.text ?? ""}`;
  const matches: RegionMatch[] = [];

  for (const region of REGIONS) {
    const town = region.towns.find((t) => mentions(haystack, t));
    if (opts.categorySlug === region.slug || town || mentions(haystack, region)) {
      matches.push({ region, town });
    }
  }
  return matches;
}

// ---------------------------------------------------------------------------
// Keywords
// ---------------------------------------------------------------------------

function regionKeywords(m: RegionMatch): string[] {
  const { region, town } = m;
  const kw = [
    `${region.hi} न्यूज़`,
    `${region.hi} समाचार`,
    `${region.hi} की ताज़ा खबर`,
    `${region.en} News`,
    `${region.en} News Today`,
  ];
  if (town) kw.unshift(`${town.hi} न्यूज़`, `${town.hi} समाचार`, `${town.en} News`);
  if (region.slug === SONBHADRA.slug) kw.push("राबर्ट्सगंज न्यूज़", "Robertsganj News");
  return kw;
}

/**
 * Automatic article keywords: tags + detected places + category + brand, plus
 * anything the editor typed into the optional SEO keywords field.
 */
export function articleKeywords(article: {
  hindiTitle: string;
  bodyHtml: string;
  location: string | null;
  seoKeywords: string | null;
  category: { slug: string; name: string; hindiName: string };
  tags: { tag: { name: string } }[];
}): string[] {
  const regions = detectRegions({
    categorySlug: article.category.slug,
    location: article.location,
    text: `${article.hindiTitle} ${plainText(article.bodyHtml).slice(0, 600)}`,
  });

  return unique([
    ...(article.seoKeywords?.split(",") ?? []),
    ...article.tags.map((t) => t.tag.name),
    ...regions.flatMap(regionKeywords),
    regions.length > 0 ? "पूर्वांचल न्यूज़" : null,
    regions.length > 0 ? "Purvanchal News" : null,
    `${article.category.hindiName} न्यूज़`,
    `${article.category.name} News`,
    "हिंदी न्यूज़",
    SITE.nameHi,
    SITE.nameEn,
  ]).slice(0, 24);
}

// ---------------------------------------------------------------------------
// Category / district page SEO
// ---------------------------------------------------------------------------

export type CategorySeo = { title: string; description: string; heading: string; intro: string; keywords: string[] };

export function categorySeo(category: {
  slug: string;
  name: string;
  hindiName: string;
  seoTitle: string | null;
  seoDescription: string | null;
  description: string | null;
}): CategorySeo {
  const region = REGIONS.find((r) => r.slug === category.slug);
  let auto: CategorySeo;

  if (region) {
    const towns = region.towns.map((t) => t.hi);
    const isSonbhadra = region.slug === SONBHADRA.slug;
    auto = {
      title: isSonbhadra
        ? "सोनभद्र न्यूज़ – Sonbhadra News Today, राबर्ट्सगंज व सोनभद्र की ताज़ा खबरें"
        : `${region.hi} न्यूज़ – ${region.en} News Today, ${region.hi} की ताज़ा खबरें`,
      description: `${region.hi} जिले की आज की ताज़ा खबरें, ब्रेकिंग न्यूज़ और हिंदी समाचार — ${towns
        .slice(0, 6)
        .join(", ")} समेत पूरे जिले से। Latest ${region.en} news in Hindi on Vindhya Leader.`,
      heading: `${region.hi} न्यूज़`,
      intro: `${region.hi} जिले${isSonbhadra ? " और मुख्यालय राबर्ट्सगंज" : ""} की हर बड़ी-छोटी खबर — ${towns.join(
        ", "
      )} से ताज़ा अपडेट, ब्रेकिंग न्यूज़, प्रशासन, राजनीति, क्राइम और जनसमस्याएँ। (${region.en} News)`,
      keywords: unique([...regionKeywords({ region }), ...region.towns.map((t) => `${t.hi} न्यूज़`), ...region.towns.map((t) => `${t.en} News`)]),
    };
  } else if (category.slug === PARENT_DISTRICT_SLUG) {
    const names = REGIONS.map((r) => r.hi).join(", ");
    auto = {
      title: `अपना जिला – ${names} की खबरें | Purvanchal District News`,
      description: `पूर्वांचल के जिलों — ${names} — की ताज़ा स्थानीय खबरें और ब्रेकिंग न्यूज़, सोनभद्र के राबर्ट्सगंज से। Purvanchal district news in Hindi.`,
      heading: "अपना जिला – पूर्वांचल की खबरें",
      intro: `पूर्वांचल के ${names} जिलों की स्थानीय खबरें एक जगह। अपना जिला चुनें और वहाँ की ताज़ा खबरें पढ़ें।`,
      keywords: unique(["पूर्वांचल न्यूज़", "Purvanchal News", ...REGIONS.flatMap((r) => [`${r.hi} न्यूज़`, `${r.en} News`])]),
    };
  } else {
    auto = {
      title: `${category.hindiName} न्यूज़ – ${category.name} News in Hindi, ${category.hindiName} की ताज़ा खबरें`,
      description: `सोनभद्र, पूर्वांचल, उत्तर प्रदेश और देश-दुनिया से ${category.hindiName} की ताज़ा खबरें व अपडेट — विंध्यलीडर (Vindhya Leader) पर। Latest ${category.name} news in Hindi.`,
      heading: category.hindiName,
      intro: `${category.hindiName} से जुड़ी ताज़ा खबरें — सोनभद्र, पूर्वांचल, उत्तर प्रदेश और देश-दुनिया से।`,
      keywords: unique([`${category.hindiName} न्यूज़`, `${category.hindiName} समाचार`, `${category.name} News`, `${category.name} News in Hindi`, "पूर्वांचल न्यूज़", "Sonbhadra News"]),
    };
  }

  // Editor-set values on the category always win.
  return {
    ...auto,
    title: category.seoTitle || auto.title,
    description: category.seoDescription || category.description || auto.description,
  };
}

// ---------------------------------------------------------------------------
// Metadata + structured data builders
// ---------------------------------------------------------------------------

type OgImage = { url: string; width?: number; height?: number; alt?: string };

/**
 * Builds a page's metadata with a canonical URL and matching Open Graph /
 * Twitter tags. (Next replaces `openGraph` wholesale in child segments, so each
 * page must supply its own images — this falls back to the branded default.)
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  keywords?: string[];
  images?: OgImage[];
  type?: "website" | "article";
  noindex?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string; authors?: string[]; section?: string; tags?: string[] };
}): Metadata {
  const images = opts.images?.length ? opts.images : [DEFAULT_OG_IMAGE];
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    // Only set these when provided: an explicit `undefined` would wipe out the
    // root layout's site-wide keywords and robots (max-image-preview) settings.
    ...(opts.keywords?.length ? { keywords: opts.keywords } : {}),
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: opts.path },
    openGraph: {
      type: opts.type ?? "website",
      siteName: SITE.nameHi,
      locale: SITE.locale,
      url: opts.path,
      title: opts.title,
      description: opts.description,
      images,
      ...(opts.type === "article" ? opts.article : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: images.map((i) => i.url),
    },
  };
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** The publisher entity — a local news organisation in Robertsganj, Sonbhadra. */
export function organizationJsonLd() {
  return {
    "@type": "NewsMediaOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE.nameHi,
    alternateName: SITE.alternateNames,
    slogan: SITE.slogan,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: absoluteUrl(LOGO_PATH), width: 512, height: 512 },
    address: { "@type": "PostalAddress", ...SITE.address },
    geo: { "@type": "GeoCoordinates", ...SITE.geo },
    areaServed: [
      ...REGIONS.map((r) => ({ "@type": "AdministrativeArea", name: `${r.en} (${r.hi})` })),
      { "@type": "Place", name: "Purvanchal (पूर्वांचल), Uttar Pradesh" },
    ],
    knowsLanguage: ["hi", "en"],
  };
}

/** Compact reference to the publisher for embedding inside other entities. */
export function publisherRef() {
  return {
    "@type": "NewsMediaOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE.nameHi,
    logo: { "@type": "ImageObject", url: absoluteUrl(LOGO_PATH), width: 512, height: 512 },
  };
}
