import { getActiveAdForSlot } from "@/lib/data/ads";
import type { AdDevice } from "@prisma/client";
import StickyAdBar from "./StickyAdBar";
import HouseAd from "./HouseAd";

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
}: {
  slotKey: string;
  device?: AdDevice;
  label?: string;
  className?: string;
}) {
  const ad = await getActiveAdForSlot(slotKey, device).catch(() => null);

  const content = ad ? (
    <div
      data-ad-slot={slotKey}
      className={`relative mx-auto flex w-full items-center justify-center overflow-hidden bg-neutral-50 ${heightClassFor(
        slotKey
      )} ${className}`}
    >
      <span className="absolute left-1 top-1 text-[10px] uppercase tracking-wide text-neutral-400">
        {label ?? "विज्ञापन"}
      </span>
      {ad.codeType === "IMAGE" && ad.imageUrl ? (
        <a href={ad.linkUrl ?? "#"} target="_blank" rel="noopener noreferrer sponsored" className="block w-full">
          {/* Ad images are admin-controlled and intentionally rendered as plain <img> (no next/image optimization needed for third-party ad creatives). */}
          <img src={ad.imageUrl} alt={ad.name} className="mx-auto max-h-[600px] w-auto" />
        </a>
      ) : ad.code ? (
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
