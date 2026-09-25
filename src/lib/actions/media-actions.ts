"use server";

import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { processAndStoreImage } from "@/lib/media-ingest";

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
  await processAndStoreImage(
    buffer,
    session!.userId,
    String(formData.get("altText") ?? ""),
    String(formData.get("caption") ?? "")
  );

  revalidatePath("/admin/media");
}

/**
 * Used by the article rich-text editor to auto-upload images pasted/dropped
 * directly into the body (e.g. copied from Word/Google Docs as base64 data
 * URIs) — replaces them with a real hosted URL instead of embedding huge
 * base64 blobs in the article HTML (which the sanitizer also strips anyway).
 */
export async function uploadEditorImageAction(
  formData: FormData
): Promise<{ url: string; id: string } | { error: string }> {
  const session = await getSession();
  if (!hasRole(session, "REPORTER")) return { error: "अनधिकृत।" };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "फ़ाइल नहीं मिली।" };
  if (!ALLOWED_MIME.has(file.type)) return { error: "असमर्थित फ़ाइल प्रकार।" };
  if (file.size > MAX_SIZE) return { error: "फ़ाइल आकार 8MB से कम होना चाहिए।" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const media = await processAndStoreImage(buffer, session!.userId);
  return { url: media.url, id: media.id };
}

export async function deleteMediaAction(mediaId: string) {
  const session = await getSession();
  if (!hasRole(session, "EDITOR")) redirect("/admin/login");
  await prisma.media.delete({ where: { id: mediaId } }).catch(() => {});
  revalidatePath("/admin/media");
}

