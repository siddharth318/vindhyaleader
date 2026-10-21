import { getActiveAdForSlot, getCarouselAdsForSlot } from "@/lib/data/ads";
import { recommendedSize } from "@/lib/ad-sizes";
import type { AdDevice } from "@prisma/client";
import StickyAdBar from "./StickyAdBar";
import HouseAd from "./HouseAd";
import AdCarousel from "./AdCarousel";

const HOUSE_AD_MS = 1000; // our own "advertise here" ad
const PAID_AD_MS = 3000; // each paid ad

const MIN_HEIGHTS: Record<string, string> = {
  leaderboard: "min-h-[90px]",
  banner: "min-h-[50px]",
  rectangle: "min-h-[250px]",
  skyscraper: "min-h-[600px]",
  native: "min-h-[120px]",
};

function heightClassFor(slotKey: string) {
  if (slotKey.includes("STICKY")) return MIN_HEIGHTS.banner;
  if (slotKey.includes("SIDEBAR")) return MIN_HEIGHTS.rectangle;
  return MIN_HEIGHTS.leaderboard;
}

/**
 * Server component ad slot. Renders our own "advertise with us" house ad when
 * no real ad is configured for this slot/device yet (e.g. before AdSense/GAM
 * is wired up) — never a fabricated third-party ad.
 */
export default async function AdSlot({
  slotKey,
  device = "ALL",
  label,
  className = "",
  withHouseAd = false,
  adsOnly = false,
}: {
  slotKey: string;
  device?: AdDevice;
  label?: string;
  className?: string;
  /**
   * Carousel: our "advertise here" house ad (1s), then each of the slot's image ads (3s each, up to
   * MAX_ADS_PER_SLOT), on repeat. Desktop (≥1024px) and phones get their own list — a slot may carry
   * DESKTOP/MOBILE creatives (e.g. the header's wide vs phone strip) as well as ALL-device ones.
   * Falls back to the normal rendering when the slot has no image ad at all.
   */
  withHouseAd?: boolean;
  /**
   * Same carousel of the slot's image ads but WITHOUT our house ad (used inside articles). Renders
   * nothing at all when the slot has no image ad.
   */
  adsOnly?: boolean;
}) {
  if (withHouseAd || adsOnly) {
    const [desktopAds, mobileAds] = await Promise.all(
      (["DESKTOP", "MOBILE"] as const).map((v) => getCarouselAdsForSlot(slotKey, v).catch(() => []))
    );

    if (desktopAds.length || mobileAds.length) {
      const carousel = (ads: typeof desktopAds, view: "DESKTOP" | "MOBILE") => {
        // The slot's required size (ad-sizes) reserves the right height before a lazy image loads,
        // so the strip doesn't jump when it does. Creatives are validated to this aspect ratio.
        const size = recommendedSize(slotKey, view);
        return (
          // No "विज्ञापन" label in these strips; the house ad flashes briefly, paid ads get the longer turn.
          <AdCarousel durations={[...(adsOnly ? [] : [HOUSE_AD_MS]), ...ads.map(() => PAID_AD_MS)]}>
            {!adsOnly && (
              <div className="flex w-full">
                <HouseAd slotKey={slotKey} compact />
              </div>
            )}
            {ads.map((ad) => (
              <a key={ad.id} href={ad.linkUrl ?? "#"} target="_blank" rel="noopener noreferrer sponsored" className="relative block w-full">
                {/* lazy: the carousel for the other screen size is display:none, so its images never download */}
                <img
                  src={ad.imageUrl!}
                  alt={ad.name}
                  loading="lazy"
                  width={size?.w}
                  height={size?.h}
                  className="block h-auto w-full"
                />
              </a>
            ))}
          </AdCarousel>
        );
      };
      const sameForBoth = desktopAds.map((a) => a.id).join() === mobileAds.map((a) => a.id).join();

      return (
        <div data-ad-slot={slotKey} className={`w-full ${className}`}>
          {sameForBoth ? (
            carousel(desktopAds, "DESKTOP")
          ) : (
            <>
              <div className="hidden lg:block">{carousel(desktopAds, "DESKTOP")}</div>
              <div className="lg:hidden">{carousel(mobileAds, "MOBILE")}</div>
            </>
          )}
        </div>
      );
    }
    if (adsOnly) return null;
  }

  const ad = await getActiveAdForSlot(slotKey, device).catch(() => null);

  const content = ad?.codeType === "IMAGE" && ad.imageUrl ? (
    // Image creatives size themselves (no reserved min-height, which would leave an empty
    // band), and the label sits above the image so it never covers the advertiser's text.
    <div
      data-ad-slot={slotKey}
      className={`w-full ${className}`}
    >
      {/* w-fit keeps the label aligned to the image's right edge, not the slot's. */}
      <div className="mx-auto w-fit max-w-full">
        <span className="block text-right text-[10px] uppercase leading-4 tracking-wide text-neutral-400">
          {label ?? "विज्ञापन"}
        </span>
        <a href={ad.linkUrl ?? "#"} target="_blank" rel="noopener noreferrer sponsored" className="block">
          {/* Ad images are admin-controlled and intentionally rendered as plain <img> (no next/image optimization needed for third-party ad creatives). */}
          <img src={ad.imageUrl} alt={ad.name} className="block h-auto max-h-[600px] w-auto max-w-full" />
        </a>
      </div>
    </div>
  ) : ad ? (
    <div
      data-ad-slot={slotKey}
      className={`relative mx-auto flex w-full items-center justify-center overflow-hidden bg-neutral-50 ${heightClassFor(
        slotKey
      )} ${className}`}
    >
      <span className="absolute left-1 top-1 text-[10px] uppercase tracking-wide text-neutral-400">
        {label ?? "विज्ञापन"}
      </span>
      {ad.code ? (
        <div className="w-full" dangerouslySetInnerHTML={{ __html: ad.code }} />
      ) : null}
    </div>
  ) : (
    <div
      data-ad-slot={slotKey}
      data-house-ad="true"
      className={`relative mx-auto w-full overflow-hidden rounded-md ${heightClassFor(slotKey)} ${className}`}
    >
      <span className="absolute left-1 top-1 z-10 text-[10px] uppercase tracking-wide text-white/70">
        {label ?? "विज्ञापन"}
      </span>
      <HouseAd slotKey={slotKey} />
    </div>
  );

  if (slotKey.includes("STICKY")) {
    return <StickyAdBar slotKey={slotKey}>{content}</StickyAdBar>;
  }

  return content;
}
