import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { AdDevice } from "@prisma/client";
import { MAX_ADS_PER_SLOT } from "@/lib/ad-capacity";

/**
 * All currently-active ads, newest-priority first, fetched ONCE per request.
 *
 * A page has many ad slots (each one asking for DESKTOP and MOBILE ads), and the database pool is
 * tiny (3 connections on the App Service) — doing one query per slot made a cold homepage render
 * fire ~14 queries and, under load, time out waiting for a connection. React's cache() shares this
 * single query between every <AdSlot> in the same render.
 */
const getActiveAds = cache(async () => {
  const now = new Date();
  return prisma.advertisement.findMany({
    where: {
      active: true,
      slot: { active: true },
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
    },
    // Equal priority: oldest first, so carousels show advertisers in the order they were added.
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    include: { slot: { select: { key: true } } },
  });
});

/**
 * The image ads a carousel slot slides through for one view (DESKTOP or MOBILE): those set for that
 * device or for ALL, highest priority first, at most MAX_ADS_PER_SLOT.
 */
export async function getCarouselAdsForSlot(slotKey: string, view: "DESKTOP" | "MOBILE") {
  const ads = await getActiveAds();
  return ads
    .filter((a) => a.slot.key === slotKey && (a.device === view || a.device === "ALL") && a.codeType === "IMAGE" && a.imageUrl)
    .slice(0, MAX_ADS_PER_SLOT);
}

/**
 * Resolve the highest-priority active advertisement for a slot/device.
 * Returns null when nothing is configured — callers must render nothing (no fake ad box).
 */
export async function getActiveAdForSlot(slotKey: string, device: AdDevice = "ALL") {
  const ads = await getActiveAds();
  return (
    ads.find((a) => a.slot.key === slotKey && (device === "ALL" || a.device === device || a.device === "ALL")) ?? null
  );
}
