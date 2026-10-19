import { NextResponse, type NextRequest } from "next/server";
import { getSession, hasRole } from "@/lib/auth";
import { storeVideoChunk, VideoUploadError } from "@/lib/video-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Receives one chunk of a video being uploaded from the article editor:
 *   POST /api/admin/video-upload?uploadId=<32 hex>&index=<n>&total=<n>&type=<video mime>
 * with the raw chunk bytes as the body. Responds { done: false } until the last chunk, then
 * { done: true, url }. Anyone who may write articles (REPORTER and up) can upload.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!hasRole(session, "REPORTER")) {
    console.warn("[video-upload] rejected: not signed in");
    return NextResponse.json({ error: "अनधिकृत — कृपया दोबारा लॉगिन करें।" }, { status: 401 });
  }

  // A custom header can't be sent cross-site without a CORS preflight, which blocks forged uploads.
  if (req.headers.get("x-video-upload") !== "1") return NextResponse.json({ error: "अमान्य अनुरोध।" }, { status: 400 });

  const q = req.nextUrl.searchParams;
  const uploadId = q.get("uploadId") ?? "";
  const index = Number(q.get("index"));
  const total = Number(q.get("total"));
  const contentType = q.get("type") ?? "";
  // One line per upload start/finish/failure (not per chunk) — enough to trace a problem in the App Service log.
  const tag = `[video-upload] ${uploadId.slice(0, 8)} ${session!.email}`;
  try {
    const bytes = Buffer.from(await req.arrayBuffer());
    if (index === 0) console.info(`${tag} start: ${contentType}, ${total} chunk(s)`);
    const result = await storeVideoChunk({ uploadId, index, total, contentType, bytes });
    if (result.done) console.info(`${tag} done: ${result.url}`);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof VideoUploadError) {
      console.warn(`${tag} rejected chunk ${index + 1}/${total} (${e.status}): ${e.message}`);
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error(`${tag} failed on chunk ${index + 1}/${total}`, e);
    return NextResponse.json({ error: "वीडियो सर्वर पर सहेजा नहीं जा सका — कृपया दोबारा कोशिश करें।" }, { status: 500 });
  }
}
