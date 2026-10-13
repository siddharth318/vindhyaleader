import { getActiveAdForSlot } from "@/lib/data/ads";
import type { AdDevice } from "@prisma/client";
import StickyAdBar from "./StickyAdBar";
import HouseAd from "./HouseAd";
import AdCarousel from "./AdCarousel";

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
}: {
  slotKey: string;
  device?: AdDevice;
  label?: string;
  className?: string;
  /**
   * Carousel that rotates our "advertise here" house ad (1s) with the slot's image ad (3s).
   * A slot may carry separate DESKTOP and MOBILE creatives (e.g. the header's wide strip vs
   * its phone strip); otherwise both resolve to the same all-device ad. Falls back to the
   * normal rendering when the slot has no image ad.
   */
  withHouseAd?: boolean;
}) {
  if (withHouseAd) {
    const [desktopAd, mobileAd] = await Promise.all(
      (["DESKTOP", "MOBILE"] as const).map((d) => getActiveAdForSlot(slotKey, d).catch(() => null))
    );
    const wide = desktopAd?.codeType === "IMAGE" && desktopAd.imageUrl ? desktopAd : null;
    const narrow = mobileAd?.codeType === "IMAGE" && mobileAd.imageUrl ? mobileAd : null;
    const linkAd = wide ?? narrow;

    if (linkAd) return (
      <div data-ad-slot={slotKey} className={`w-full ${className}`}>
        {/* House ad flashes briefly, the paid creative gets the longer turn. No "विज्ञापन" label in this strip. */}
        <AdCarousel durations={[1000, 3000]}>
          <div className="flex w-full">
            <HouseAd slotKey={slotKey} compact />
          </div>
          <a href={linkAd.linkUrl ?? "#"} target="_blank" rel="noopener noreferrer sponsored" className="relative block w-full">
            <picture>
              {wide && narrow && wide.imageUrl !== narrow.imageUrl && (
                <source media="(min-width: 1024px)" srcSet={wide.imageUrl!} />
              )}
              <img src={(narrow ?? wide)!.imageUrl!} alt={linkAd.name} className="block h-auto w-full" />
            </picture>
          </a>
        </AdCarousel>
      </div>
    );
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
