import { prisma } from "@/lib/prisma";
import {
  createAdSlotAction,
  toggleAdvertisementAction,
  deleteAdvertisementAction,
} from "@/lib/actions/ad-actions";
import SubmitButton from "@/components/admin/SubmitButton";
import AdCreateForm from "@/components/admin/AdCreateForm";

export const metadata = { title: "विज्ञापन प्रबंधन" };

export default async function AdsPage() {
  const [slots, ads] = await Promise.all([
    prisma.adSlot.findMany({ orderBy: { key: "asc" } }),
    prisma.advertisement.findMany({ orderBy: { priority: "desc" }, include: { slot: true } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-xl font-bold">विज्ञापन स्लॉट</h1>
        <form action={createAdSlotAction} className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
          <input name="key" placeholder="SLOT_KEY (जैसे HOME_HERO_TOP)" required className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm sm:w-auto" />
          <input name="label" placeholder="लेबल" required className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm sm:w-auto" />
          <input name="description" placeholder="विवरण (वैकल्पिक)" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm sm:w-auto" />
          <SubmitButton
            pendingText="जोड़ा जा रहा है…"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            + स्लॉट जोड़ें
          </SubmitButton>
        </form>
        <div className="flex flex-wrap gap-2 text-xs">
          {slots.map((s) => (
            <span key={s.id} className={`rounded-full px-3 py-1 ${s.active ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-500"}`}>
              {s.key}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">विज्ञापन जोड़ें</h2>
        <AdCreateForm slots={slots.map((s) => ({ id: s.id, key: s.key }))} />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">सभी विज्ञापन</h2>

        {/* Phones: one card per ad (a 7-column table is unusable at 375px). */}
        <div className="space-y-3 md:hidden">
          {ads.map((ad) => (
            <div key={ad.id} className="rounded-lg border border-neutral-200 bg-white p-3">
              <div className="flex items-start gap-3">
                {ad.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ad.imageUrl} alt="" className="h-12 w-20 shrink-0 rounded object-cover ring-1 ring-black/10" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold leading-snug">{ad.name}</p>
                  <p className="mt-0.5 break-all text-xs text-neutral-500">{ad.slot.key}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {ad.device} · {ad.codeType} · प्राथमिकता {ad.priority}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-sm">
                <form action={toggleAdvertisementAction.bind(null, ad.id, !ad.active)}>
                  <SubmitButton
                    className={`inline-flex items-center gap-1.5 py-1 disabled:opacity-50 ${ad.active ? "text-green-700" : "text-neutral-400"}`}
                  >
                    {ad.active ? "✅ सक्रिय" : "❌ निष्क्रिय"}
                  </SubmitButton>
                </form>
                <form action={deleteAdvertisementAction.bind(null, ad.id)}>
                  <SubmitButton
                    confirm="इस विज्ञापन को हटाना निश्चित है?"
                    className="inline-flex items-center gap-1.5 py-1 text-red-700 hover:underline disabled:opacity-50"
                  >
                    हटाएँ
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))}
          {ads.length === 0 && <p className="py-6 text-center text-neutral-400">अभी कोई विज्ञापन नहीं है।</p>}
        </div>

        <div className="hidden overflow-x-auto rounded-lg border border-neutral-200 bg-white md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-2">नाम</th>
                <th className="px-4 py-2">स्लॉट</th>
                <th className="px-4 py-2">डिवाइस</th>
                <th className="px-4 py-2">प्रकार</th>
                <th className="px-4 py-2">प्राथमिकता</th>
                <th className="px-4 py-2">सक्रिय</th>
                <th className="px-4 py-2">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {ads.map((ad) => (
                <tr key={ad.id}>
                  <td className="px-4 py-2 font-medium">
                    <div className="flex items-center gap-2">
                      {ad.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ad.imageUrl} alt="" className="h-8 w-14 shrink-0 rounded object-cover ring-1 ring-black/10" />
                      )}
                      <span>{ad.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-neutral-500">{ad.slot.key}</td>
                  <td className="px-4 py-2 text-neutral-500">{ad.device}</td>
                  <td className="px-4 py-2 text-neutral-500">{ad.codeType}</td>
                  <td className="px-4 py-2">{ad.priority}</td>
                  <td className="px-4 py-2">
                    <form action={toggleAdvertisementAction.bind(null, ad.id, !ad.active)}>
                      <SubmitButton
                        className={`inline-flex items-center gap-1.5 disabled:opacity-50 ${ad.active ? "text-green-700" : "text-neutral-400"}`}
                      >
                        {ad.active ? "✅ सक्रिय" : "❌ निष्क्रिय"}
                      </SubmitButton>
                    </form>
                  </td>
                  <td className="px-4 py-2">
                    <form action={deleteAdvertisementAction.bind(null, ad.id)}>
                      <SubmitButton
                        confirm="इस विज्ञापन को हटाना निश्चित है?"
                        className="inline-flex items-center gap-1.5 text-red-700 hover:underline disabled:opacity-50"
                      >
                        हटाएँ
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
              {ads.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-neutral-400">अभी कोई विज्ञापन नहीं है।</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
