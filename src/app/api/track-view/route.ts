import { NextResponse } from "next/server";
import { recordArticleView } from "@/lib/data/articles";

// Never cached — every real article read hits this and increments the counter.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { articleId } = await request.json();
    if (typeof articleId !== "string" || !articleId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    // Fire-and-forget; a bad/stale id just fails the upsert harmlessly.
    await recordArticleView(articleId).catch(() => {});
  } catch {
    // Ignore malformed bodies — tracking must never break page delivery.
  }
  return new NextResponse(null, { status: 204 });
}
