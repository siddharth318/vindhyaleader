"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth";
import { processAndStoreImage } from "@/lib/media-ingest";
import { fetchImageBuffer, measureImage } from "@/lib/ad-image";
import { sizeError } from "@/lib/ad-sizes";
import type { AdDevice, AdCodeType } from "@prisma/client";

const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB — same cap as the media library

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

/** Result of the "add advertisement" form; `error` is shown on screen, `nonce` resets the form. */
export type AdFormState = { error?: string; nonce?: number };

export async function createAdvertisementAction(_prev: AdFormState, formData: FormData): Promise<AdFormState> {
  const session = await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slotId = String(formData.get("slotId") ?? "");
  if (!name || !slotId) return { error: "नाम और स्लॉट आवश्यक हैं।" };

  const slot = await prisma.adSlot.findUnique({ where: { id: slotId }, select: { key: true } });
  if (!slot) return { error: "चुना हुआ स्लॉट नहीं मिला।" };

  const device = String(formData.get("device") ?? "ALL") as AdDevice;
  let codeType = String(formData.get("codeType") ?? "IMAGE") as AdCodeType;
  let imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const file = formData.get("imageFile") as File | null;
  const hasFile = !!file && file.size > 0;

  // Image ads: the image must be EXACTLY the size its slot needs (sizeError), otherwise nothing is
  // stored or created. Checked here too — not just in the browser — so it can't be bypassed.
  if (hasFile || codeType === "IMAGE") {
    let buffer: Buffer;
    try {
      if (hasFile) {
        if (!ALLOWED_IMAGE_MIME.has(file.type)) return { error: "केवल JPEG, PNG, WebP या GIF अनुमत हैं।" };
        if (file.size > MAX_IMAGE_SIZE) return { error: "फ़ाइल आकार 8MB से कम होना चाहिए।" };
        buffer = Buffer.from(await file.arrayBuffer());
      } else if (imageUrl) {
        buffer = await fetchImageBuffer(imageUrl);
      } else {
        return { error: "इमेज अपलोड करें या इमेज URL डालें।" };
      }
    } catch (e) {
      return { error: e instanceof Error ? e.message : "इमेज पढ़ी नहीं जा सकी।" };
    }

    let size;
    try {
      size = await measureImage(buffer);
    } catch {
      return { error: "यह फ़ाइल सही इमेज नहीं लग रही — कृपया JPG, PNG या WebP इमेज दें।" };
    }
    const wrongSize = sizeError(slot.key, device, size);
    if (wrongSize) return { error: wrongSize };

    // An uploaded file wins over a pasted URL. It goes through the media pipeline (WebP, EXIF
    // stripped) at up to 3200px wide so the header strip keeps its 2× sharpness.
    if (hasFile) {
      const media = await processAndStoreImage(buffer, session.userId, name, null, { maxWidth: 3200, quality: 90 });
      imageUrl = media.url;
      codeType = "IMAGE";
    }
  }

  const startDateRaw = String(formData.get("startDate") ?? "");
  const endDateRaw = String(formData.get("endDate") ?? "");

  await prisma.advertisement.create({
    data: {
      name,
      slotId,
      device,
      codeType,
      code: String(formData.get("code") ?? "") || null,
      imageUrl,
      linkUrl: String(formData.get("linkUrl") ?? "") || null,
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      endDate: endDateRaw ? new Date(endDateRaw) : null,
      priority: Number(formData.get("priority") ?? 0),
      active: formData.get("active") === "on",
    },
  });

  revalidatePath("/admin/ads");
  revalidatePath("/");
  return { nonce: Date.now() };
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
