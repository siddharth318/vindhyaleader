import { getSettings } from "@/lib/data/settings";

/** Publisher ID from the AdSense account; admin settings can override it. */
export const DEFAULT_ADSENSE_CLIENT = "ca-pub-8080236861469753";

export type AdSenseConfig = {
  /** "ca-pub-…", or null when AdSense is switched off (setting cleared to "off"). */
  client: string | null;
  /** In-article ad unit ID ("data-ad-slot") from AdSense → Ads → By ad unit. */
  inArticleSlot: string | null;
};

export async function getAdSenseConfig(): Promise<AdSenseConfig> {
  const s = await getSettings(["adsense_client_id", "adsense_inarticle_slot"]).catch(
    () => ({}) as Record<string, string | null>
  );
  const raw = s.adsense_client_id?.trim();
  const client = raw?.toLowerCase() === "off" ? null : raw || DEFAULT_ADSENSE_CLIENT;
  return { client, inArticleSlot: s.adsense_inarticle_slot?.trim() || null };
}
