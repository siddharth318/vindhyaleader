import Link from "next/link";
import { LogoMark } from "@/components/Logo";

/**
 * In-house "advertise with us" creative shown when no real ad is configured
 * for a slot yet (e.g. before AdSense/GAM is wired up). Distinct from a fake
 * third-party ad — it promotes our own advertising page, a standard "house ad"
 * publishers use to fill unsold inventory.
 */
export default function HouseAd({ slotKey }: { slotKey: string }) {
  const vertical = slotKey.includes("SIDEBAR");

  if (vertical) {
    return (
      <Link
        href="/advertise-with-us"
        className="group flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-red-700 via-red-600 to-orange-600 p-5 text-center text-white"
      >
        <LogoMark className="h-11 w-11 ring-2 ring-white/40" instanceId={`house-${slotKey}`} />
        <p className="font-display text-base font-extrabold leading-tight">
          अपने व्यापार का
          <br />
          विज्ञापन यहाँ दें
        </p>
        <p className="text-xs text-red-100">विंध्य क्षेत्र के हज़ारों पाठकों तक पहुंचें</p>
        <span className="mt-1 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-red-700 shadow-sm transition-transform group-hover:scale-105">
          संपर्क करें →
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/advertise-with-us"
      className="group flex h-full w-full items-center justify-center gap-4 bg-gradient-to-r from-red-700 via-red-600 to-orange-600 px-4 py-3 text-white"
    >
      <LogoMark className="h-9 w-9 shrink-0 ring-2 ring-white/40" instanceId={`house-${slotKey}`} />
      <p className="min-w-0 flex-1 truncate font-display text-sm font-bold sm:text-base">
        अपने व्यापार का विज्ञापन यहाँ दें — विंध्य क्षेत्र के हज़ारों पाठकों तक पहुंचें
      </p>
      <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-red-700 shadow-sm transition-transform group-hover:scale-105 sm:px-4">
        संपर्क करें →
      </span>
    </Link>
  );
}
