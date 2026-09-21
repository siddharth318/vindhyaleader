import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Google News sitemap — published articles from the last 48 hours only, per Google News spec. */
export async function GET() {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: twoDaysAgo } },
    orderBy: { publishedAt: "desc" },
    take: 1000,
    select: {
      slug: true,
      hindiTitle: true,
      publishedAt: true,
      category: { select: { slug: true } },
    },
  });

  const urls = articles
    .map(
      (a) => `  <url>
    <loc>${siteUrl}/${a.category.slug}/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>विंध्यलीडर</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt?.toISOString()}</news:publication_date>
      <news:title>${escapeXml(a.hindiTitle)}</news:title>
    </news:news>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=UTF-8" },
  });
}
