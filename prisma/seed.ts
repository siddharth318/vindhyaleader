import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding विंध्यलीडर database...");

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
    create: {
      name: "प्रियांशु शुक्ला",
      email: "reporter@vindhyaleader.com",
      passwordHash,
      role: "REPORTER",
    },
  });

  // --- Categories ---
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
      create: {
        hindiName: d.hindiName,
        name: d.name,
        slug: d.slug,
        parentId: ownDistrict.id,
        displayOrder: i,
      },
    });
    categoryMap[d.slug] = cat.id;
  }
  categoryMap["apna-jila"] = ownDistrict.id;

  // --- Ad slots (see docs/02-architecture.md for the full map) ---
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

  const slotIds: Record<string, string> = {};
  for (const [key, label] of slotKeys) {
    const slot = await prisma.adSlot.upsert({
      where: { key },
      update: {},
      create: { key, label },
    });
    slotIds[key] = slot.id;
  }

  // Note: no demo/placeholder Advertisement rows are seeded — empty slots
  // automatically render the "advertise with us" house ad (see HouseAd.tsx)
  // until real AdSense/GAM ads are configured by an admin.

  // --- Sample articles ---
  const sampleArticles = [
    {
      hindiTitle: "सोनभद्र में नई सड़क परियोजना का शिलान्यास, क्षेत्र के विकास को मिलेगी रफ़्तार",
      title: "sonbhadra-new-road-project-foundation",
      categorySlug: "sonbhadra",
      excerpt: "जिले में सड़क कनेक्टिविटी बढ़ाने के लिए प्रशासन ने नई परियोजना का शिलान्यास किया।",
      location: "सोनभद्र",
      isFeatured: true,
      isBreaking: true,
      authorId: editor.id,
    },
    {
      hindiTitle: "उत्तर प्रदेश सरकार ने शुरू की नई रोजगार योजना, लाखों युवाओं को मिलेगा लाभ",
      title: "up-government-new-employment-scheme",
      categorySlug: "uttar-pradesh",
      excerpt: "योजना के तहत प्रशिक्षण के साथ वित्तीय सहायता भी दी जाएगी।",
      location: "लखनऊ",
      isFeatured: true,
      authorId: editor.id,
    },
    {
      hindiTitle: "रॉबर्ट्सगंज में चोरी की बड़ी वारदात, पुलिस ने शुरू की जांच",
      title: "robertsganj-theft-case-police-investigation",
      categorySlug: "crime",
      excerpt: "घटना की सूचना मिलते ही पुलिस टीम मौके पर पहुंची।",
      location: "रॉबर्ट्सगंज, सोनभद्र",
      isBreaking: true,
      authorId: superAdmin.id,
    },
    {
      hindiTitle: "भारत ने जीता रोमांचक मुकाबला, अंतिम ओवर में मिली जीत",
      title: "india-wins-thrilling-match",
      categorySlug: "sports",
      excerpt: "आखिरी गेंद तक चले मुकाबले में भारतीय टीम ने जीत दर्ज की।",
      location: "नई दिल्ली",
      isTrending: true,
      authorId: editor.id,
    },
    {
      hindiTitle: "मिर्जापुर में डिजिटल शिक्षा को बढ़ावा, स्कूलों में लगे स्मार्ट क्लासरूम",
      title: "mirzapur-digital-education-smart-classrooms",
      categorySlug: "mirzapur",
      excerpt: "जिले के सरकारी स्कूलों में स्मार्ट क्लासरूम की सुविधा शुरू की गई।",
      location: "मिर्जापुर",
      authorId: superAdmin.id,
    },
    {
      hindiTitle: "वाराणसी में सांस्कृतिक महोत्सव की धूम, देशभर से पहुंचे कलाकार",
      title: "varanasi-cultural-festival",
      categorySlug: "varanasi",
      excerpt: "गंगा घाट पर आयोजित महोत्सव में शास्त्रीय संगीत और नृत्य की प्रस्तुतियां हुईं।",
      location: "वाराणसी",
      isEditorsPick: true,
      authorId: editor.id,
    },
    {
      hindiTitle: "बॉलीवुड की नई फिल्म ने बॉक्स ऑफिस पर मचाई धूम",
      title: "bollywood-new-film-box-office",
      categorySlug: "entertainment",
      excerpt: "पहले ही सप्ताह में फिल्म ने शानदार कमाई की।",
      location: "मुंबई",
      authorId: editor.id,
    },
    {
      hindiTitle: "आज का राशिफल: जानें किन राशियों के लिए रहेगा शुभ दिन",
      title: "aaj-ka-rashifal",
      categorySlug: "rashifal",
      excerpt: "जानिए सभी 12 राशियों का आज का राशिफल।",
      authorId: superAdmin.id,
    },
  ];

  for (const a of sampleArticles) {
    const categoryId = categoryMap[a.categorySlug];
    if (!categoryId) continue;
    const slug = a.title;
    await prisma.article.upsert({
      where: { slug },
      update: {},
      create: {
        title: a.title,
        hindiTitle: a.hindiTitle,
        slug,
        excerpt: a.excerpt,
        bodyHtml: `<p>${a.excerpt}</p><p>विंध्यलीडर संवाददाता द्वारा विस्तृत रिपोर्ट। यह एक नमूना समाचार सामग्री है जिसे एडमिन पैनल के माध्यम से संपादित किया जा सकता है।</p>`,
        categoryId,
        authorId: a.authorId,
        location: a.location ?? null,
        status: "PUBLISHED",
        publishedAt: new Date(),
        isFeatured: a.isFeatured ?? false,
        isBreaking: a.isBreaking ?? false,
        isTrending: a.isTrending ?? false,
        isEditorsPick: a.isEditorsPick ?? false,
      },
    });
  }

  // --- Settings defaults ---
  await prisma.setting.upsert({
    where: { key: "breaking_ticker_enabled" },
    update: {},
    create: { key: "breaking_ticker_enabled", value: "1" },
  });

  // --- Example migration redirect (old WordPress date-based URL -> new clean URL) ---
  await prisma.redirectRule.upsert({
    where: { fromPath: "/10/09/2026/national/sample-old-url" },
    update: {},
    create: {
      fromPath: "/10/09/2026/national/sample-old-url",
      toPath: "/national/india-government-new-employment-scheme",
      statusCode: 301,
    },
  });

  console.log("Seed complete.");
  console.log("Super Admin (approves & publishes): rajendra.dwivedi@vindhyaleader.com");
  console.log("Editor (creates, sends for review): brijesh.pathak@vindhyaleader.com");
  console.log("Reporter: reporter@vindhyaleader.com");
  console.log("Password (all): Passw0rd!123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
