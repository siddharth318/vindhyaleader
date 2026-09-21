import { prisma } from "@/lib/prisma";
import type { AdDevice } from "@prisma/client";

/**
 * Resolve the highest-priority active advertisement for a slot/device.
 * Returns null when nothing is configured — callers must render nothing (no fake ad box).
 */
export async function getActiveAdForSlot(slotKey: string, device: AdDevice = "ALL") {
  const now = new Date();
  const ad = await prisma.advertisement.findFirst({
    where: {
      active: true,
      slot: { key: slotKey, active: true },
      device: device === "ALL" ? undefined : { in: [device, "ALL"] },
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
    },
    orderBy: { priority: "desc" },
  });
  return ad;
}
