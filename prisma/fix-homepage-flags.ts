/**
 * One-off fix: only image-backed articles should be marked Featured/Breaking/
 * Trending so the homepage hero/rails always show a real photo, never the
 * gradient placeholder. Run: npx tsx prisma/fix-homepage-flags.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Clear all homepage-highlight flags on articles that have no featured image.
  const cleared = await prisma.article.updateMany({
    where: { featuredImageId: null },
    data: { isFeatured: false, isBreaking: false, isTrending: false, isEditorsPick: false },
  });
  console.log(`Cleared highlight flags on ${cleared.count} image-less articles.`);

  // 2. Re-derive flags from the image-backed articles only, newest first.
  const withImages = await prisma.article.findMany({
    where: { status: "PUBLISHED", featuredImageId: { not: null } },
    orderBy: { publishedAt: "desc" },
    select: { id: true, hindiTitle: true },
  });

  if (withImages.length === 0) {
    console.log("No image-backed articles found — nothing to flag.");
    return;
  }

  const featuredIds = withImages.slice(0, 6).map((a) => a.id);
  const breakingIds = withImages.slice(0, 2).map((a) => a.id);
  const trendingIds = withImages.slice(2, 5).map((a) => a.id);
  const editorsPickId = withImages[5]?.id ?? withImages[withImages.length - 1].id;

  await prisma.article.updateMany({ data: { isFeatured: true }, where: { id: { in: featuredIds } } });
  await prisma.article.updateMany({ data: { isBreaking: true }, where: { id: { in: breakingIds } } });
  await prisma.article.updateMany({ data: { isTrending: true }, where: { id: { in: trendingIds } } });
  await prisma.article.update({ where: { id: editorsPickId }, data: { isEditorsPick: true } });

  console.log(`Featured: ${featuredIds.length}, Breaking: ${breakingIds.length}, Trending: ${trendingIds.length}`);
  console.log("Done — homepage will now only highlight image-backed articles.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
