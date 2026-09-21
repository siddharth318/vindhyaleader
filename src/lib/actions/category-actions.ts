"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth";
import { slugify } from "@/lib/slug";

async function requireEditor() {
  const session = await getSession();
  if (!hasRole(session, "EDITOR")) redirect("/admin/login");
  return session!;
}

export async function createCategoryAction(formData: FormData) {
  await requireEditor();
  const hindiName = String(formData.get("hindiName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || hindiName;
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const parentId = String(formData.get("parentId") ?? "") || null;

  if (!hindiName) throw new Error("श्रेणी का हिंदी नाम आवश्यक है।");

  await prisma.category.create({
    data: {
      name,
      hindiName,
      slug,
      parentId,
      description: String(formData.get("description") ?? "") || null,
      displayOrder: Number(formData.get("displayOrder") ?? 0),
      seoTitle: String(formData.get("seoTitle") ?? "") || null,
      seoDescription: String(formData.get("seoDescription") ?? "") || null,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function updateCategoryAction(categoryId: string, formData: FormData) {
  await requireEditor();
  const hindiName = String(formData.get("hindiName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || hindiName;
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const parentId = String(formData.get("parentId") ?? "") || null;

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name,
      hindiName,
      slug,
      parentId,
      description: String(formData.get("description") ?? "") || null,
      displayOrder: Number(formData.get("displayOrder") ?? 0),
      active: formData.get("active") === "on",
      seoTitle: String(formData.get("seoTitle") ?? "") || null,
      seoDescription: String(formData.get("seoDescription") ?? "") || null,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(categoryId: string) {
  await requireEditor();
  const articleCount = await prisma.article.count({ where: { categoryId } });
  if (articleCount > 0) {
    throw new Error("इस श्रेणी में खबरें मौजूद हैं, पहले उन्हें स्थानांतरित करें।");
  }
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categories");
}
