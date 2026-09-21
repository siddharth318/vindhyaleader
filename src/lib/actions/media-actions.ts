"use server";

import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveUpload } from "@/lib/storage";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function uploadMediaAction(formData: FormData) {
  const session = await getSession();
  if (!hasRole(session, "REPORTER")) redirect("/admin/login");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("कृपया एक फ़ाइल चुनें।");
  if (!ALLOWED_MIME.has(file.type)) throw new Error("केवल JPEG, PNG, WebP या GIF अनुमत हैं।");
  if (file.size > MAX_SIZE) throw new Error("फ़ाइल आकार 8MB से कम होना चाहिए।");

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  // Re-encode to WebP (strips EXIF/malicious metadata, ensures consistent optimized format).
  const image = sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 });
  const outputBuffer = await image.toBuffer();
  const metadata = await sharp(outputBuffer).metadata();
  const url = await saveUpload(outputBuffer, safeName, "image/webp");

  const media = await prisma.media.create({
    data: {
      filename: safeName,
      url,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      altText: String(formData.get("altText") ?? "") || null,
      caption: String(formData.get("caption") ?? "") || null,
      uploadedById: session!.userId,
    },
  });

  await prisma.auditLog.create({
    data: { userId: session!.userId, action: "UPLOAD", entityType: "Media", entityId: media.id },
  });

  revalidatePath("/admin/media");
}

export async function deleteMediaAction(mediaId: string) {
  const session = await getSession();
  if (!hasRole(session, "EDITOR")) redirect("/admin/login");
  await prisma.media.delete({ where: { id: mediaId } }).catch(() => {});
  revalidatePath("/admin/media");
}
