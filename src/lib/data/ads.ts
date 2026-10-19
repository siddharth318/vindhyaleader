import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { AdDevice } from "@prisma/client";

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
    orderBy: { priority: "desc" },
    include: { slot: { select: { key: true } } },
  });
});

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
