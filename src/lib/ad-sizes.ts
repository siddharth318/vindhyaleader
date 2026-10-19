/**
 * Required creative size per ad slot, in pixels. Sizes are 2× the on-screen size so they
 * stay sharp on high-density phones. Image ads for a slot listed here must match its size
 * EXACTLY — enforced by the admin form (client) and createAdvertisementAction (server) via
 * sizeError(). Slots not listed have no requirement. Keep in sync with where <AdSlot> is placed.
 */
export type AdDevice = "ALL" | "DESKTOP" | "TABLET" | "MOBILE";
export type AdSize = { w: number; h: number };

export type AdSlotSpec = {
  /** Where the slot appears, in Hindi (shown in the admin form). */
  where: string;
  /** Required size for each device choice; a missing device falls back to `ALL`. */
  sizes: Partial<Record<AdDevice, AdSize>>;
  /** Extra advice shown under the size. */
  note?: string;
};

const STRIP: AdSize = { w: 1456, h: 180 };
const STRIP_MOBILE: AdSize = { w: 750, h: 120 };
const BIG: AdSize = { w: 600, h: 500 };

const STRIP_SLOT: AdSlotSpec = {
  where: "पूरी चौड़ाई की पट्टी (strip)",
  sizes: { ALL: STRIP, DESKTOP: STRIP, MOBILE: STRIP_MOBILE },
  note: "एक ही इमेज सभी स्क्रीन पर चौड़ाई के हिसाब से छोटी-बड़ी होती है। मोबाइल पर यह लगभग 343px चौड़ी दिखती है, इसलिए अक्षर बड़े और मोटे रखें। चाहें तो मोबाइल के लिए 750×120 की अलग इमेज (डिवाइस: मोबाइल) जोड़ें।",
};

const BIG_SLOT: AdSlotSpec = {
  where: "बड़ा बैनर",
  sizes: { ALL: BIG },
  note: "यही एक इमेज डेस्कटॉप (300×250) और मोबाइल (पूरी चौड़ाई) दोनों पर सही बैठती है।",
};

export const AD_SLOT_SPECS: Record<string, AdSlotSpec> = {
  HEADER_TOP_LEADERBOARD: {
    where: "वेबसाइट के सबसे ऊपर की पतली पट्टी",
    sizes: { DESKTOP: { w: 3200, h: 160 }, MOBILE: STRIP_MOBILE, ALL: STRIP_MOBILE },
    note: "इसके लिए दो विज्ञापन जोड़ें: एक 'डेस्कटॉप' (3200×160) और एक 'मोबाइल' (750×120)। 'सभी डिवाइस' चुनने पर 750×120 वाली इमेज ही चलेगी, जो डेस्कटॉप पर बहुत ऊँची दिखेगी।",
  },
  HOME_BELOW_HERO: STRIP_SLOT,
  HOME_BETWEEN_SECTIONS: STRIP_SLOT,
  FOOTER_TOP: STRIP_SLOT,
  CATEGORY_TOP: STRIP_SLOT,
  CATEGORY_IN_GRID: STRIP_SLOT,
  ARTICLE_TOP: STRIP_SLOT,
  ARTICLE_BOTTOM: STRIP_SLOT,
  SIDEBAR_TOP: BIG_SLOT,
  ARTICLE_POPUP: {
    where: "खबर खोलने के 5 सेकंड बाद पॉप-अप",
    sizes: { ALL: BIG },
    note: "पॉप-अप में अधिकतम 420px चौड़ाई पर दिखता है।",
  },
};

export function recommendedSize(slotKey: string, device: string): AdSize | null {
  const spec = AD_SLOT_SPECS[slotKey];
  if (!spec) return null;
  return spec.sizes[device as AdDevice] ?? spec.sizes.ALL ?? null;
}

const DEVICE_LABEL: Record<string, string> = {
  ALL: "सभी डिवाइस",
  DESKTOP: "डेस्कटॉप",
  TABLET: "टैबलेट",
  MOBILE: "मोबाइल",
};

/**
 * Returns a Hindi error message if `actual` is not exactly the size this slot/device needs,
 * or null if it fits (or the slot has no size requirement).
 */
export function sizeError(slotKey: string, device: string, actual: AdSize): string | null {
  const wanted = recommendedSize(slotKey, device);
  if (!wanted) return null;
  if (actual.w === wanted.w && actual.h === wanted.h) return null;
  return `इमेज का साइज़ ${actual.w}×${actual.h} px है, लेकिन ${slotKey} (${DEVICE_LABEL[device] ?? device}) के लिए ठीक ${wanted.w}×${wanted.h} px चाहिए।`;
}
