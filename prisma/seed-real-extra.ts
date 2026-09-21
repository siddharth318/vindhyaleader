/**
 * Upgrades the placeholder demo articles (sports/sonbhadra/mirzapur/varanasi/
 * rashifal) with real scraped content + images from vindhyaleader.com,
 * keeping the same slug so no URL breaks. Run: npx tsx prisma/seed-real-extra.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "seed");

type Scraped = { url: string; title: string; image: string; desc: string; pub: string; cat: string };

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&hellip;/g, "…")
    .replace(/&#8230;/g, "…")
    .replace(/&#8221;/g, "\u201d")
    .replace(/\s+/g, " ")
    .trim();
}
const cleanTitle = (raw: string) => decodeEntities(raw.replace(/\s*-\s*Vindhya Leader\s*$/i, ""));
const cleanExcerpt = (raw: string) => decodeEntities(raw).replace(/\[…\]\s*$/, "").trim();

// old-site category -> existing demo article slug to upgrade in place
const TARGET_SLUG: Record<string, string> = {
  sports: "india-wins-thrilling-match",
  sonbhadra: "sonbhadra-new-road-project-foundation",
  mirjapur: "mirzapur-digital-education-smart-classrooms",
  varanasi: "varanasi-cultural-festival",
  rashifal: "aaj-ka-rashifal",
};

async function downloadImage(url: string, destName: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_DIR, destName), buf);
    return `/uploads/seed/${destName}`;
  } catch {
    return null;
  }
}

async function main() {
  const raw = fs.readFileSync(path.join(process.cwd(), "scraped-extra.json"), "utf-8").replace(/^\uFEFF/, "");
  const items: Scraped[] = JSON.parse(raw);

  const editor = await prisma.user.findUnique({ where: { email: "brijesh.pathak@vindhyaleader.com" } });
  const admin = await prisma.user.findUnique({ where: { email: "rajendra.dwivedi@vindhyaleader.com" } });
  const author = editor ?? admin;
  if (!author) throw new Error("Run `npm run db:seed` first.");

  for (const item of items) {
    const targetSlug = TARGET_SLUG[item.cat];
    if (!targetSlug || item.title === "NONE" || !item.title) {
      console.log(`Skipping cat=${item.cat} (no upgrade target or no data)`);
      continue;
    }
    const existing = await prisma.article.findUnique({ where: { slug: targetSlug } });
    if (!existing) {
      console.log(`Skipping ${item.cat}: target slug ${targetSlug} not found`);
      continue;
    }

    const hindiTitle = cleanTitle(item.title);
    const excerpt = cleanExcerpt(item.desc);

    let mediaId: string | null = existing.featuredImageId;
    if (item.image) {
      const ext = path.extname(new URL(item.image).pathname) || ".jpg";
      const destName = `real-${item.cat}-upgrade${ext}`;
      const localUrl = await downloadImage(item.image, destName);
      if (localUrl) {
        const media = await prisma.media.create({
          data: { filename: destName, url: localUrl, altText: hindiTitle, uploadedById: author.id },
        });
        mediaId = media.id;
      }
    }

    await prisma.article.update({
      where: { slug: targetSlug },
      data: {
        hindiTitle,
        excerpt,
        bodyHtml: `<p>${excerpt}</p><p>(यह सामग्री मूल vindhyaleader.com से माइग्रेट की गई है — व्यवस्थापक इसे संपादित कर सकते हैं।)</p>`,
        featuredImageId: mediaId,
        publishedAt: item.pub ? new Date(item.pub) : existing.publishedAt,
      },
    });
    console.log(`Upgraded [${item.cat}] ${targetSlug} -> ${hindiTitle.slice(0, 50)}... [${mediaId ? "with image" : "no image"}]`);
  }

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
