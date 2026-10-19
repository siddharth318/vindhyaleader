import { VIDEO_CHUNK_BYTES, VIDEO_MAX_BYTES, videoTypeFor } from "@/lib/video";

/** Browser side of the chunked video upload (see /api/admin/video-upload). */

const ENDPOINT = "/api/admin/video-upload";
const MAX_ATTEMPTS = 3;

class ServerRejected extends Error {}

function sendChunk(url: string, chunk: Blob, signal: AbortSignal, onBytes: (loaded: number) => void) {
  return new Promise<{ status: number; body: { done?: boolean; url?: string; error?: string } | null }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("x-video-upload", "1");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => onBytes(e.loaded);
    xhr.onload = () => resolve({ status: xhr.status, body: xhr.response });
    xhr.onerror = () => reject(new Error("network"));
    xhr.onabort = () => reject(new DOMException("aborted", "AbortError"));
    if (signal.aborted) return xhr.abort();
    signal.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(chunk);
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Uploads a video file in 4 MB chunks and resolves to its public URL.
 * `onProgress(sentBytes, totalBytes)` fires continuously; abort `signal` to cancel.
 * Rejects with a Hindi message that can be shown to the editor as-is.
 */
export async function uploadVideo(file: File, onProgress: (sent: number, total: number) => void, signal: AbortSignal): Promise<string> {
  const type = videoTypeFor(file);
  if (!type) throw new Error("केवल MP4, WebM या MOV वीडियो अनुमत हैं।");
  if (file.size === 0) throw new Error("फ़ाइल खाली है।");
  if (file.size > VIDEO_MAX_BYTES) throw new Error(`वीडियो ${VIDEO_MAX_BYTES / 1024 / 1024}MB से छोटा होना चाहिए।`);

  const uploadId = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
  const total = Math.ceil(file.size / VIDEO_CHUNK_BYTES);

  for (let index = 0; index < total; index++) {
    const start = index * VIDEO_CHUNK_BYTES;
    const chunk = file.slice(start, Math.min(start + VIDEO_CHUNK_BYTES, file.size));
    const url = `${ENDPOINT}?uploadId=${uploadId}&index=${index}&total=${total}&type=${encodeURIComponent(type)}`;

    for (let attempt = 1; ; attempt++) {
      try {
        const { status, body } = await sendChunk(url, chunk, signal, (loaded) => onProgress(start + loaded, file.size));
        if (status >= 200 && status < 300 && body) {
          if (index === total - 1) {
            if (body.done && body.url) return body.url;
            throw new ServerRejected("वीडियो सर्वर पर पूरा सहेजा नहीं गया — कृपया दोबारा कोशिश करें।");
          }
          break; // chunk accepted, on to the next
        }
        // 4xx = the server refused this upload for good; 5xx = worth retrying.
        if (status < 500) throw new ServerRejected(body?.error ?? "वीडियो अपलोड नहीं हो सका।");
        throw new Error("server");
      } catch (e) {
        if (e instanceof ServerRejected || (e instanceof DOMException && e.name === "AbortError")) throw e;
        if (attempt >= MAX_ATTEMPTS) throw new Error("नेटवर्क की समस्या से वीडियो अपलोड नहीं हो सका — कृपया दोबारा कोशिश करें।");
        await sleep(attempt * 1000);
      }
    }
    onProgress(Math.min(start + VIDEO_CHUNK_BYTES, file.size), file.size);
  }
  throw new Error("वीडियो अपलोड नहीं हो सका।"); // unreachable: the last chunk returns above
}
