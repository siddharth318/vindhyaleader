/**
 * Renames the already-seeded dev accounts to the requested named credentials
 * without touching their IDs (keeps existing Article.authorId references intact).
 * Run: npx tsx prisma/rename-admins.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const superAdmin = await prisma.user.updateMany({
    where: { email: "admin@vindhyaleader.com" },
    data: {
      name: "राजेंद्र द्विवेदी",
      email: "rajendra.dwivedi@vindhyaleader.com",
      bio: "प्रधान संपादक व सुपर एडमिन — सभी खबरों की अंतिम स्वीकृति एवं प्रकाशन इन्हीं के अधिकार क्षेत्र में है।",
    },
  });

  console.log(`Super Admin rows updated: ${superAdmin.count} -> rajendra.dwivedi@vindhyaleader.com`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
