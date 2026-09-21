import { prisma } from "@/lib/prisma";
import { uploadMediaAction, deleteMediaAction } from "@/lib/actions/media-actions";

export const metadata = { title: "मीडिया लाइब्रेरी" };

export default async function MediaLibraryPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">मीडिया लाइब्रेरी</h1>

      <form
        action={uploadMediaAction}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">फ़ाइल चुनें</label>
          <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Alt Text</label>
          <input name="altText" className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">कैप्शन</label>
          <input name="caption" className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
          अपलोड करें
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {media.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.altText ?? m.filename} className="aspect-square w-full object-cover" />
            <div className="p-2">
              <p className="truncate text-xs text-neutral-500" title={m.url}>{m.url}</p>
              <form action={deleteMediaAction.bind(null, m.id)}>
                <button className="mt-1 text-xs text-red-700 hover:underline">हटाएँ</button>
              </form>
            </div>
          </div>
        ))}
        {media.length === 0 && <p className="col-span-full py-8 text-center text-neutral-400">अभी कोई मीडिया नहीं है।</p>}
      </div>
    </div>
  );
}
