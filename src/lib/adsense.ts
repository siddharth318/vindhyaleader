import { getSettings } from "@/lib/data/settings";

/** Publisher ID from the AdSense account; admin settings can override it. */
export const DEFAULT_ADSENSE_CLIENT = "ca-pub-8080236861469753";

export type AdSenseConfig = {
  /** "ca-pub-…", or null when AdSense is switched off (setting cleared to "off"). */
  client: string | null;
  /** In-article ad unit ID ("data-ad-slot") from AdSense → Ads → By ad unit. */
  inArticleSlot: string | null;
};

/** AdSense ad unit IDs ("data-ad-slot") are always 10 digits. */
export const isValidAdSlot = (slot: string | null | undefined): slot is string => !!slot && /^\d{10}$/.test(slot);

/**
 * Pulls the ad unit ID out of whatever the admin pasted: the bare number, or the whole
 * <ins class="adsbygoogle" … data-ad-slot="1234567890"> snippet AdSense shows.
 */
export function parseAdSlotInput(raw: string): string {
  const fromSnippet = raw.match(/data-ad-slot\s*=\s*["']?(\d+)/i)?.[1];
  return fromSnippet ?? raw.replace(/\D/g, "");
}

export async function getAdSenseConfig(): Promise<AdSenseConfig> {
  const s = await getSettings(["adsense_client_id", "adsense_inarticle_slot"]).catch(
    () => ({}) as Record<string, string | null>
  );
  const raw = s.adsense_client_id?.trim();
  const client = raw?.toLowerCase() === "off" ? null : raw || DEFAULT_ADSENSE_CLIENT;
  // An invalid ID (e.g. the publisher ID pasted by mistake) would only produce broken ad requests.
  const slot = s.adsense_inarticle_slot?.trim();
  return { client, inArticleSlot: isValidAdSlot(slot) ? slot : null };
}
