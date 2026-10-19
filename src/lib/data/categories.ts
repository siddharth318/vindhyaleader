import { cache } from "react";
import { prisma } from "@/lib/prisma";

// cache(): the header and the homepage both ask for the menu in the same request — share one query.
export const getNavCategories = cache(async () => {
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
});

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
