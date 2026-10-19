/**
 * One-off script: pulls the scraped.json (real article metadata/images fetched
 * from the existing vindhyaleader.com site) and seeds it into the new DB,
 * downloading images locally under public/uploads/seed/ (re-hosting, per the
 * documented migration strategy in docs/02-architecture.md).
 *
 * Run: npx tsx prisma/seed-real.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "seed");

type Scraped = {
  url: string;
  title: string;
  image: string;
  desc: string;
  pub: string;
  cat: string;
};

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&hellip;/g, "…")
    .replace(/&#8230;/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(raw: string): string {
  return decodeEntities(raw.replace(/\s*-\s*Vindhya Leader\s*$/i, ""));
}

function cleanExcerpt(raw: string): string {
  return decodeEntities(raw).replace(/\[…\]\s*$/, "").trim();
}

// Old WP category slug -> our Category slug
const CATEGORY_MAP: Record<string, string> = {
  national: "national",
  international: "international",
  uttarpradesh: "uttar-pradesh",
  education: "education",
  crime: "crime",
  sports: "sports",
  entertainment: "entertainment",
  business: "business",
  health: "health",
  technology: "technology",
  dharma: "dharma",
  rashifal: "rashifal",
  uncategorized: "national",
  "our-district": "apna-jila",
  sonbhadra: "sonbhadra",
};

async function downloadImage(url: string, destName: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const filePath = path.join(UPLOAD_DIR, destName);
    fs.writeFileSync(filePath, buf);
    return `/uploads/seed/${destName}`;
  } catch {
    return null;
  }
}

async function main() {
  const raw = fs.readFileSync(path.join(process.cwd(), "scraped.json"), "utf-8").replace(/^\uFEFF/, "");
  const items: Scraped[] = JSON.parse(raw);

  const editor = await prisma.user.findUnique({ where: { email: "brijesh.pathak@vindhyaleader.com" } });
  const admin = await prisma.user.findUnique({ where: { email: "rajendra.dwivedi@vindhyaleader.com" } });
  const author = editor ?? admin;
  if (!author) throw new Error("Run `npm run db:seed` first to create users/categories.");

  let count = 0;
  for (const [i, item] of items.entries()) {
    if (item.title === "ERROR" || !item.title) continue;

    const categorySlug = CATEGORY_MAP[item.cat] ?? "national";
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) continue;

    const hindiTitle = cleanTitle(item.title);
    const excerpt = cleanExcerpt(item.desc);
    const slug = `real-${categorySlug}-${i + 1}`;

    let mediaId: string | null = null;
    if (item.image) {
      const ext = path.extname(new URL(item.image).pathname) || ".jpg";
      const destName = `real-${categorySlug}-${i + 1}${ext}`;
      const localUrl = await downloadImage(item.image, destName);
      if (localUrl) {
        const media = await prisma.media.create({
          data: {
            filename: destName,
            url: localUrl,
            altText: hindiTitle,
            uploadedById: author.id,
          },
        });
        mediaId = media.id;
      }
    }

    await prisma.article.upsert({
      where: { slug },
      update: {},
      create: {
        title: slug,
        hindiTitle,
        slug,
        excerpt,
        bodyHtml: `<p>${excerpt}</p><p>(यह सामग्री मूल vindhyaleader.com से माइग्रेट की गई है — व्यवस्थापक इसे संपादित कर सकते हैं।)</p>`,
        categoryId: category.id,
        authorId: author.id,
        featuredImageId: mediaId,
        status: "PUBLISHED",
        publishedAt: item.pub ? new Date(item.pub) : new Date(),
        isFeatured: i < 3,
        isBreaking: i < 2,
        isTrending: i >= 3 && i < 6,
      },
    });
    count++;
    console.log(`Seeded: ${hindiTitle.slice(0, 60)}... [${mediaId ? "with image" : "no image"}]`);
  }

  console.log(`\nDone. Seeded ${count} real articles from vindhyaleader.com.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
