import { prisma } from "@/lib/prisma";
import { createCategoryAction, deleteCategoryAction } from "@/lib/actions/category-actions";
import SubmitButton from "@/components/admin/SubmitButton";

export const metadata = { title: "श्रेणी प्रबंधन" };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { displayOrder: "asc" }],
    include: { parent: true, _count: { select: { articles: true } } },
  });

  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">श्रेणी प्रबंधन</h1>

      <form action={createCategoryAction} className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input name="hindiName" placeholder="हिंदी नाम *" required className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        <input name="name" placeholder="English नाम" className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        <input name="slug" placeholder="slug (auto)" className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        <select name="parentId" className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <option value="">-- कोई पैरेंट नहीं (मुख्य श्रेणी) --</option>
          {topLevel.map((c) => (
            <option key={c.id} value={c.id}>{c.hindiName}</option>
          ))}
        </select>
        <input name="displayOrder" type="number" placeholder="क्रम संख्या" defaultValue={0} className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        <input name="description" placeholder="विवरण" className="rounded-md border border-neutral-300 px-3 py-2 text-sm sm:col-span-2" />
        <SubmitButton
          pendingText="जोड़ा जा रहा है…"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          + श्रेणी जोड़ें
        </SubmitButton>
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-2">नाम</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">पैरेंट</th>
              <th className="px-4 py-2">खबरें</th>
              <th className="px-4 py-2">सक्रिय</th>
              <th className="px-4 py-2">कार्रवाई</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2 font-medium">{c.hindiName}</td>
                <td className="px-4 py-2 text-neutral-500">/{c.slug}</td>
                <td className="px-4 py-2 text-neutral-500">{c.parent?.hindiName ?? "—"}</td>
                <td className="px-4 py-2">{c._count.articles}</td>
                <td className="px-4 py-2">{c.active ? "✅" : "❌"}</td>
                <td className="px-4 py-2">
                  <form action={deleteCategoryAction.bind(null, c.id)}>
                    <SubmitButton
                      confirm="इस श्रेणी को हटाना निश्चित है?"
                      className="inline-flex items-center gap-1.5 text-red-700 hover:underline disabled:opacity-50"
                    >
                      हटाएँ
                    </SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
