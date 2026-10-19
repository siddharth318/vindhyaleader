import path from "node:path";
import { appendFile, mkdir, stat, writeFile } from "node:fs/promises";
import { BlobServiceClient } from "@azure/storage-blob";
import { VIDEO_CHUNK_BYTES, VIDEO_MAX_CHUNKS, VIDEO_TYPES } from "@/lib/video";

/**
 * Chunked video upload. A video is far bigger than a Server Action / request body may be, so the
 * browser sends it as numbered 4 MB chunks (see /api/admin/video-upload). Each chunk is staged as a
 * block of one Azure block blob — nothing is held in server memory or on disk — and the last chunk
 * commits the blocks into the finished file. Without Azure configured (local dev) the chunks are
 * appended to a file in public/uploads instead.
 *
 * State lives entirely in the blob/file, so any server instance can take any chunk, and a chunk
 * that is re-sent after a network hiccup simply overwrites itself.
 */

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const containerName = process.env.AZURE_STORAGE_CONTAINER ?? "uploads";
const UPLOAD_ID = /^[a-f0-9]{32}$/;

export type VideoChunk = {
  uploadId: string;
  index: number;
  total: number;
  contentType: string;
  bytes: Buffer;
};

export type VideoChunkResult = { done: false } | { done: true; url: string };

/** Thrown for any problem with the request itself; the message is Hindi and safe to show. */
export class VideoUploadError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

/** Does the start of the file look like the container format its MIME type claims? */
function hasVideoSignature(b: Buffer, contentType: string): boolean {
  if (contentType === "video/webm") {
    return b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3;
  }
  // MP4 / MOV: the first box is "ftyp" (older QuickTime files may open with another atom).
  const box = b.subarray(4, 8).toString("latin1");
  return b.length >= 12 && (box === "ftyp" || (contentType === "video/quicktime" && ["moov", "mdat", "wide", "free", "skip"].includes(box)));
}

function blockId(index: number): string {
  // Azure needs every block id in a blob to have the same length (before base64).
  return Buffer.from(String(index).padStart(6, "0")).toString("base64");
}

export async function storeVideoChunk(chunk: VideoChunk): Promise<VideoChunkResult> {
  const { uploadId, index, total, contentType, bytes } = chunk;

  const ext = VIDEO_TYPES[contentType];
  if (!ext) throw new VideoUploadError("केवल MP4, WebM या MOV वीडियो अनुमत हैं।");
  if (!UPLOAD_ID.test(uploadId)) throw new VideoUploadError("अपलोड आईडी सही नहीं है।");
  if (!Number.isInteger(total) || total < 1 || total > VIDEO_MAX_CHUNKS) {
    throw new VideoUploadError(`वीडियो ${Math.round((VIDEO_MAX_CHUNKS * VIDEO_CHUNK_BYTES) / 1024 / 1024)}MB से छोटा होना चाहिए।`);
  }
  if (!Number.isInteger(index) || index < 0 || index >= total) throw new VideoUploadError("अपलोड का क्रम सही नहीं है।");

  const last = index === total - 1;
  if (bytes.length === 0 || bytes.length > VIDEO_CHUNK_BYTES || (!last && bytes.length !== VIDEO_CHUNK_BYTES)) {
    throw new VideoUploadError("अपलोड का हिस्सा गलत आकार का है।");
  }
  if (index === 0 && !hasVideoSignature(bytes, contentType)) {
    throw new VideoUploadError("यह फ़ाइल सही वीडियो नहीं लग रही — कृपया MP4, WebM या MOV फ़ाइल चुनें।");
  }

  const filename = `video-${uploadId}.${ext}`;
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (connectionString) {
    const blob = BlobServiceClient.fromConnectionString(connectionString).getContainerClient(containerName).getBlockBlobClient(filename);
    // A finished video is never overwritten — a repeated upload id is refused up front.
    if (index === 0 && (await blob.exists())) throw new VideoUploadError("यह अपलोड पहले ही पूरा हो चुका है।", 409);

    await blob.stageBlock(blockId(index), bytes, bytes.length);
    if (!last) return { done: false };

    await blob.commitBlockList(
      Array.from({ length: total }, (_, i) => blockId(i)),
      { blobHTTPHeaders: { blobContentType: contentType, blobCacheControl: "public, max-age=31536000, immutable" } }
    );
    return { done: true, url: blob.url };
  }

  // Local dev: chunks must arrive in order; each one is appended.
  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  const file = path.join(LOCAL_UPLOAD_DIR, filename);
  if (index === 0) {
    if (await stat(file).then(() => true, () => false)) throw new VideoUploadError("यह अपलोड पहले ही पूरा हो चुका है।", 409);
    await writeFile(file, bytes);
  } else {
    const size = await stat(file).then((s) => s.size, () => -1);
    if (size !== index * VIDEO_CHUNK_BYTES) throw new VideoUploadError("अपलोड का क्रम बिगड़ गया — कृपया दोबारा अपलोड करें।", 409);
    await appendFile(file, bytes);
  }
  return last ? { done: true, url: `/uploads/${filename}` } : { done: false };
}
