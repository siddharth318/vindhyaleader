import { prisma } from "@/lib/prisma";
import {
  createAdSlotAction,
  createAdvertisementAction,
  toggleAdvertisementAction,
  deleteAdvertisementAction,
} from "@/lib/actions/ad-actions";

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
          <input name="key" placeholder="SLOT_KEY (जैसे HOME_HERO_TOP)" required className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          <input name="label" placeholder="लेबल" required className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          <input name="description" placeholder="विवरण (वैकल्पिक)" className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
            + स्लॉट जोड़ें
          </button>
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
        <form action={createAdvertisementAction} className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
          <input name="name" placeholder="विज्ञापन नाम *" required className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          <select name="slotId" required className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
            <option value="">-- स्लॉट चुनें --</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>{s.key}</option>
            ))}
          </select>
          <select name="device" defaultValue="ALL" className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
            <option value="ALL">सभी डिवाइस</option>
            <option value="DESKTOP">डेस्कटॉप</option>
            <option value="TABLET">टैबलेट</option>
            <option value="MOBILE">मोबाइल</option>
          </select>
          <select name="codeType" defaultValue="IMAGE" className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
            <option value="IMAGE">इमेज बैनर</option>
            <option value="ADSENSE">Google AdSense कोड</option>
            <option value="GPT">Google Ad Manager (GPT) कोड</option>
            <option value="HTML">कस्टम HTML/JS</option>
          </select>
          <input name="imageUrl" placeholder="इमेज URL (इमेज प्रकार हेतु)" className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          <input name="linkUrl" placeholder="क्लिक लिंक URL" className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          <textarea name="code" placeholder="AdSense/GPT/HTML कोड (वैकल्पिक)" rows={3} className="rounded-md border border-neutral-300 px-3 py-2 text-sm sm:col-span-2 lg:col-span-3" />
          <label className="text-sm text-neutral-600">शुरू तारीख<input type="date" name="startDate" className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" /></label>
          <label className="text-sm text-neutral-600">अंत तारीख<input type="date" name="endDate" className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" /></label>
          <label className="text-sm text-neutral-600">प्राथमिकता<input type="number" name="priority" defaultValue={0} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> सक्रिय</label>
          <button type="submit" className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 sm:col-span-2 lg:col-span-1">
            + विज्ञापन जोड़ें
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">सभी विज्ञापन</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
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
                  <td className="px-4 py-2 font-medium">{ad.name}</td>
                  <td className="px-4 py-2 text-neutral-500">{ad.slot.key}</td>
                  <td className="px-4 py-2 text-neutral-500">{ad.device}</td>
                  <td className="px-4 py-2 text-neutral-500">{ad.codeType}</td>
                  <td className="px-4 py-2">{ad.priority}</td>
                  <td className="px-4 py-2">
                    <form action={toggleAdvertisementAction.bind(null, ad.id, !ad.active)}>
                      <button className={ad.active ? "text-green-700" : "text-neutral-400"}>
                        {ad.active ? "✅ सक्रिय" : "❌ निष्क्रिय"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2">
                    <form action={deleteAdvertisementAction.bind(null, ad.id)}>
                      <button className="text-red-700 hover:underline">हटाएँ</button>
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
