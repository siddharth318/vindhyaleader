/**
 * How many paid ads may share one slot. Carousel slots slide through all of them (plus our own
 * "advertise here" house ad), so this is "3 + 1". Enforced when an ad is added or switched on.
 *
 * A slot is seen in two views: desktop (ads for DESKTOP or ALL) and phone (MOBILE or ALL). The
 * limit applies to each view, so an advertiser with a desktop + a mobile creative counts once
 * in each. TABLET-only ads aren't shown in carousels and don't count.
 */
export const MAX_ADS_PER_SLOT = 3;

type View = "DESKTOP" | "MOBILE";
const VIEW_LABEL: Record<View, string> = { DESKTOP: "डेस्कटॉप", MOBILE: "मोबाइल" };

/** The views an ad with this device setting appears in. */
export function viewsFor(device: string): View[] {
  if (device === "ALL") return ["DESKTOP", "MOBILE"];
  if (device === "DESKTOP" || device === "MOBILE") return [device];
  return [];
}

/**
 * Hindi error if adding/activating an ad with `device` would put more than MAX_ADS_PER_SLOT ads in
 * any view of the slot, given the slot's other currently-running ads. Null if it fits.
 */
export function capacityError(device: string, others: { device: string; name: string }[]): string | null {
  for (const view of viewsFor(device)) {
    const running = others.filter((a) => viewsFor(a.device).includes(view));
    if (running.length >= MAX_ADS_PER_SLOT) {
      return (
        `इस स्लॉट में ${VIEW_LABEL[view]} पर पहले से ${MAX_ADS_PER_SLOT} विज्ञापन चल रहे हैं ` +
        `(${running.map((a) => a.name).join(", ")})। नया विज्ञापन चलाने से पहले इनमें से किसी एक को निष्क्रिय करें।`
      );
    }
  }
  return null;
}
