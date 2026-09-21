/**
 * Push remaining image-less placeholder articles far into the past so they
 * sink to the bottom of every "newest first" listing (Latest, category rails)
 * instead of visually dominating the homepage ahead of real, photographed news.
 * Run: npx tsx prisma/backdate-placeholders.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.article.updateMany({
    where: { featuredImageId: null, status: "PUBLISHED" },
    data: { publishedAt: new Date("2025-01-01T00:00:00Z") },
  });
  console.log(`Backdated ${result.count} image-less placeholder articles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
