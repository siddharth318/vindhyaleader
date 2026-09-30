/**
 * One-time migration: give articles with placeholder slugs ("article-xxxxx",
 * or bare numbers — created before Hindi headlines were transliterated) a
 * descriptive slug, and add a 301 RedirectRule from the old URL so existing
 * search rankings and shared links keep working.
 *
 *   npx tsx prisma/migrate-placeholder-slugs.ts          # dry run (no writes)
 *   npx tsx prisma/migrate-placeholder-slugs.ts --apply  # write changes
 *
 * Run --apply only AFTER the redirect-aware code is deployed, otherwise the
 * old URLs 404 on the live site in the meantime.
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { slugify, isPlaceholderSlug, uniqueSuffix } from "../src/lib/slug";

const APPLY = process.argv.includes("--apply");

async function main() {
  const articles = await prisma.article.findMany({
    select: { id: true, slug: true, hindiTitle: true, title: true, category: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });

  const taken = new Set(articles.map((a) => a.slug));
  const plan: { id: string; from: string; to: string; oldSlug: string; newSlug: string }[] = [];

  for (const a of articles) {
    if (!isPlaceholderSlug(a.slug)) continue;

    const base = slugify(a.hindiTitle) || slugify(a.title);
    if (!base) continue;

    let slug = base;
    while (taken.has(slug)) slug = `${base}-${uniqueSuffix()}`;
    taken.add(slug);

    plan.push({
      id: a.id,
      oldSlug: a.slug,
      newSlug: slug,
      from: `/${a.category.slug}/${a.slug}`,
      to: `/${a.category.slug}/${slug}`,
    });
  }

  for (const p of plan) console.log(`${p.from}\n   → ${p.to}`);
  console.log(`\n${plan.length} article(s) to migrate. ${APPLY ? "Applying…" : "Dry run — re-run with --apply to write."}`);
  if (!APPLY) return;

  for (const p of plan) {
    await prisma.$transaction([
      prisma.article.update({ where: { id: p.id }, data: { slug: p.newSlug } }),
      prisma.redirectRule.upsert({
        where: { fromPath: p.from },
        create: { fromPath: p.from, toPath: p.to, statusCode: 301 },
        update: { toPath: p.to, statusCode: 301, active: true },
      }),
    ]);
  }
  console.log(`Done — ${plan.length} slug(s) updated with 301 redirects.`);
}

main().finally(() => prisma.$disconnect());
