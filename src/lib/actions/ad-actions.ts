"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth";
import type { AdDevice, AdCodeType } from "@prisma/client";

async function requireSuperAdmin() {
  const session = await getSession();
  if (!hasRole(session, "SUPER_ADMIN")) redirect("/admin/login");
  return session!;
}

export async function createAdSlotAction(formData: FormData) {
  await requireSuperAdmin();
  const key = String(formData.get("key") ?? "").trim().toUpperCase().replace(/\s+/g, "_");
  const label = String(formData.get("label") ?? "").trim();
  if (!key || !label) throw new Error("Slot key और label आवश्यक हैं।");

  await prisma.adSlot.create({
    data: { key, label, description: String(formData.get("description") ?? "") || null },
  });
  revalidatePath("/admin/ads");
}

export async function createAdvertisementAction(formData: FormData) {
  await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slotId = String(formData.get("slotId") ?? "");
  if (!name || !slotId) throw new Error("नाम और स्लॉट आवश्यक हैं।");

  const startDateRaw = String(formData.get("startDate") ?? "");
  const endDateRaw = String(formData.get("endDate") ?? "");

  await prisma.advertisement.create({
    data: {
      name,
      slotId,
      device: (String(formData.get("device") ?? "ALL") as AdDevice),
      codeType: (String(formData.get("codeType") ?? "IMAGE") as AdCodeType),
      code: String(formData.get("code") ?? "") || null,
      imageUrl: String(formData.get("imageUrl") ?? "") || null,
      linkUrl: String(formData.get("linkUrl") ?? "") || null,
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      endDate: endDateRaw ? new Date(endDateRaw) : null,
      priority: Number(formData.get("priority") ?? 0),
      active: formData.get("active") === "on",
    },
  });

  revalidatePath("/admin/ads");
  revalidatePath("/");
}

export async function toggleAdvertisementAction(id: string, active: boolean) {
  await requireSuperAdmin();
  await prisma.advertisement.update({ where: { id }, data: { active } });
  revalidatePath("/admin/ads");
  revalidatePath("/");
}

export async function deleteAdvertisementAction(id: string) {
  await requireSuperAdmin();
  await prisma.advertisement.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/ads");
  revalidatePath("/");
}
