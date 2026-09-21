import { prisma } from "@/lib/prisma";

export async function getNavCategories() {
  return prisma.category.findMany({
    where: { active: true, parentId: null },
    orderBy: { displayOrder: "asc" },
    include: {
      children: {
        where: { active: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });
}

export async function getAllActiveCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { parent: true, children: true },
  });
}
