/**
 * One-shot production seed: base data (users/categories/ad-slots/demo articles)
 * plus real scraped articles+images from vindhyaleader.com, with images uploaded
 * to Azure Blob Storage via the same saveUpload() helper the admin CMS uses.
 * Run: npx tsx prisma/seed-production.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { saveUpload } from "../src/lib/storage";

const prisma = new PrismaClient();

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

type Scraped = { url: string; title: string; image: string; desc: string; pub: string; cat: string };

async function scrapeCategoryPages(cats: string[]): Promise<Scraped[]> {
  const results: Scraped[] = [];
  for (const c of cats) {
    try {
      const listRes = await fetch(`https://vindhyaleader.com/category/${c}/`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      const listHtml = await listRes.text();
      const m = listHtml.match(/https:\/\/vindhyaleader\.com\/\d{2}\/\d{2}\/\d{4}\/[a-zA-Z-]+\/[^"'\s]+\//);
      if (!m) continue;
      const url = m[0];
      const artRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const html = await artRes.text();
      const title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? "";
      const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? "";
      const desc = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] ?? "";
      const pub = html.match(/"datePublished":"([^"]+)"/)?.[1] ?? "";
      if (title) results.push({ url, title, image, desc, pub, cat: c });
    } catch {
      // Skip categories that fail to fetch — non-fatal for seeding.
    }
  }
  return results;
}

const CATEGORY_MAP: Record<string, string> = {
  national: "national",
  international: "international",
  uttarpradesh: "uttar-pradesh",
  education: "education",
  crime: "crime",
  sports: "sports",
  entertainment: "entertainment",
  sonbhadra: "sonbhadra",
  mirjapur: "mirzapur",
  varanasi: "varanasi",
  rashifal: "rashifal",
};

async function main() {
  console.log("Seeding विंध्यलीडर production database...");
  const passwordHash = await bcrypt.hash("Passw0rd!123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "rajendra.dwivedi@vindhyaleader.com" },
    update: {},
    create: {
      name: "राजेंद्र द्विवेदी",
      email: "rajendra.dwivedi@vindhyaleader.com",
      passwordHash,
      role: "SUPER_ADMIN",
      bio: "प्रधान संपादक व सुपर एडमिन — सभी खबरों की अंतिम स्वीकृति एवं प्रकाशन इन्हीं के अधिकार क्षेत्र में है।",
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "brijesh.pathak@vindhyaleader.com" },
    update: {},
    create: {
      name: "बृजेश पाठक",
      email: "brijesh.pathak@vindhyaleader.com",
      passwordHash,
      role: "EDITOR",
      bio: "वरिष्ठ संपादक — खबरें बनाता/संपादित करता है; प्रकाशन हेतु सुपर एडमिन की स्वीकृति आवश्यक है।",
    },
  });

  await prisma.user.upsert({
    where: { email: "reporter@vindhyaleader.com" },
    update: {},
    create: { name: "प्रियांशु शुक्ला", email: "reporter@vindhyaleader.com", passwordHash, role: "REPORTER" },
  });

  const topCategories = [
    { hindiName: "देश", name: "National", slug: "national", order: 1 },
    { hindiName: "विदेश", name: "International", slug: "international", order: 2 },
    { hindiName: "उत्तर प्रदेश", name: "Uttar Pradesh", slug: "uttar-pradesh", order: 3 },
    { hindiName: "राजनीति", name: "Politics", slug: "politics", order: 4 },
    { hindiName: "क्राइम", name: "Crime", slug: "crime", order: 5 },
    { hindiName: "खेल", name: "Sports", slug: "sports", order: 6 },
    { hindiName: "मनोरंजन", name: "Entertainment", slug: "entertainment", order: 7 },
    { hindiName: "बिजनेस", name: "Business", slug: "business", order: 8 },
    { hindiName: "शिक्षा", name: "Education", slug: "education", order: 9 },
    { hindiName: "स्वास्थ्य", name: "Health", slug: "health", order: 10 },
    { hindiName: "टेक्नोलॉजी", name: "Technology", slug: "technology", order: 11 },
    { hindiName: "धर्म", name: "Dharma", slug: "dharma", order: 12 },
    { hindiName: "राशिफल", name: "Rashifal", slug: "rashifal", order: 13 },
  ];
  const categoryMap: Record<string, string> = {};
  for (const c of topCategories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { hindiName: c.hindiName, name: c.name, slug: c.slug, displayOrder: c.order },
    });
    categoryMap[c.slug] = cat.id;
  }

  const ownDistrict = await prisma.category.upsert({
    where: { slug: "apna-jila" },
    update: {},
    create: { hindiName: "अपना जिला", name: "Our District", slug: "apna-jila", displayOrder: 0 },
  });
  const districts = [
    { hindiName: "सोनभद्र", name: "Sonbhadra", slug: "sonbhadra" },
    { hindiName: "मिर्जापुर", name: "Mirzapur", slug: "mirzapur" },
    { hindiName: "वाराणसी", name: "Varanasi", slug: "varanasi" },
    { hindiName: "चंदौली", name: "Chandauli", slug: "chandauli" },
    { hindiName: "गाजीपुर", name: "Ghazipur", slug: "ghazipur" },
  ];
  for (let i = 0; i < districts.length; i++) {
    const d = districts[i];
    const cat = await prisma.category.upsert({
      where: { slug: d.slug },
      update: {},
      create: { hindiName: d.hindiName, name: d.name, slug: d.slug, parentId: ownDistrict.id, displayOrder: i },
    });
    categoryMap[d.slug] = cat.id;
  }
  categoryMap["apna-jila"] = ownDistrict.id;

  const slotKeys = [
    ["HEADER_TOP_LEADERBOARD", "हेडर टॉप लीडरबोर्ड"],
    ["HEADER_MOBILE_BANNER", "मोबाइल हेडर बैनर"],
    ["HOME_BELOW_NAV", "होम - नेविगेशन के नीचे"],
    ["HOME_BELOW_BREAKING", "होम - ब्रेकिंग टिकर के नीचे"],
    ["HOME_BELOW_HERO", "होम - हीरो सेक्शन के नीचे"],
    ["HOME_BETWEEN_SECTIONS", "होम - सेक्शनों के बीच"],
    ["SIDEBAR_TOP", "साइडबार टॉप"],
    ["SIDEBAR_STICKY", "साइडबार स्टिकी"],
    ["ARTICLE_TOP", "आर्टिकल टॉप"],
    ["ARTICLE_IN_CONTENT", "आर्टिकल इन-कंटेंट"],
    ["ARTICLE_BOTTOM", "आर्टिकल बॉटम"],
    ["ARTICLE_SIDEBAR", "आर्टिकल साइडबार"],
    ["RELATED_CONTENT_NATIVE", "संबंधित सामग्री नेटिव"],
    ["MOBILE_STICKY_BOTTOM", "मोबाइल स्टिकी बॉटम"],
    ["DESKTOP_STICKY_FOOTER", "डेस्कटॉप स्टिकी फुटर"],
    ["CATEGORY_TOP", "श्रेणी पेज टॉप"],
    ["CATEGORY_IN_GRID", "श्रेणी ग्रिड में"],
    ["FOOTER_TOP", "फुटर के ऊपर"],
  ] as const;
  for (const [key, label] of slotKeys) {
    await prisma.adSlot.upsert({ where: { key }, update: {}, create: { key, label } });
  }

  await prisma.setting.upsert({
    where: { key: "breaking_ticker_enabled" },
    update: {},
    create: { key: "breaking_ticker_enabled", value: "1" },
  });

  // --- Real scraped articles with images uploaded to Blob storage ---
  console.log("Scraping real articles from vindhyaleader.com...");
  const cats = ["national", "international", "uttarpradesh", "education", "sports", "sonbhadra", "mirjapur", "varanasi", "rashifal"];
  const scraped = await scrapeCategoryPages(cats);
  console.log(`Scraped ${scraped.length} articles.`);

  let seededCount = 0;
  for (const [i, item] of scraped.entries()) {
    const categorySlug = CATEGORY_MAP[item.cat] ?? "national";
    const categoryId = categoryMap[categorySlug];
    if (!categoryId) continue;

    const hindiTitle = cleanTitle(item.title);
    const excerpt = cleanExcerpt(item.desc);
    const slug = `real-${categorySlug}-${i + 1}`;

    let mediaId: string | null = null;
    if (item.image) {
      try {
        const imgRes = await fetch(item.image, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          const ext = new URL(item.image).pathname.split(".").pop() || "jpg";
          const filename = `real-${categorySlug}-${i + 1}.${ext}`;
          const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
          const url = await saveUpload(buf, filename, contentType);
          const media = await prisma.media.create({
            data: { filename, url, altText: hindiTitle, uploadedById: editor.id },
          });
          mediaId = media.id;
        }
      } catch {
        // Image download failed — article is still seeded without a featured image.
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
        categoryId,
        authorId: editor.id,
        featuredImageId: mediaId,
        status: "PUBLISHED",
        publishedAt: item.pub ? new Date(item.pub) : new Date(),
      },
    });
    seededCount++;
    console.log(`Seeded [${categorySlug}] ${hindiTitle.slice(0, 50)}... [${mediaId ? "with image" : "no image"}]`);
  }

  // --- Derive homepage highlight flags from image-backed articles only ---
  const withImages = await prisma.article.findMany({
    where: { status: "PUBLISHED", featuredImageId: { not: null } },
    orderBy: { publishedAt: "desc" },
    select: { id: true },
  });
  const featuredIds = withImages.slice(0, 6).map((a) => a.id);
  const breakingIds = withImages.slice(0, 2).map((a) => a.id);
  const trendingIds = withImages.slice(2, 5).map((a) => a.id);
  if (featuredIds.length) await prisma.article.updateMany({ where: { id: { in: featuredIds } }, data: { isFeatured: true } });
  if (breakingIds.length) await prisma.article.updateMany({ where: { id: { in: breakingIds } }, data: { isBreaking: true } });
  if (trendingIds.length) await prisma.article.updateMany({ where: { id: { in: trendingIds } }, data: { isTrending: true } });

  console.log(`\nDone. Seeded ${seededCount} real articles (super admin: ${superAdmin.email}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
