import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const config = {
  // Only run for paths that can have a redirect rule — avoids a DB lookup on every request:
  //  - old WordPress date-based permalinks (/DD/MM/YYYY/category/slug/)
  //  - pre-transliteration placeholder article URLs (/category/article-xxxxx, /category/123)
  //    that were migrated to descriptive slugs.
  // (Other slug changes are redirected by the article page itself.)
  matcher: [
    "/:d1(\\d{2})/:d2(\\d{2})/:d3(\\d{4})/:rest*",
    "/:category/:slug(article-[a-z0-9]{5}|\\d+)",
  ],
};

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const rule = await prisma.redirectRule
    .findUnique({ where: { fromPath: path } })
    .catch(() => null);

  if (rule && rule.active) {
    const url = req.nextUrl.clone();
    url.pathname = rule.toPath;
    return NextResponse.redirect(url, rule.statusCode);
  }

  return NextResponse.next();
}
