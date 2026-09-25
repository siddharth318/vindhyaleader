import { getSettings } from "@/lib/data/settings";
import { updateSettingsAction } from "@/lib/actions/settings-actions";
import SubmitButton from "@/components/admin/SubmitButton";

export const metadata = { title: "सेटिंग्स" };

export default async function SettingsPage() {
  const settings = await getSettings([
    "ga4_id",
    "gtm_id",
    "adsense_client_id",
    "breaking_ticker_enabled",
    "contact_phone",
    "contact_email",
  ]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">साइट सेटिंग्स</h1>
      <form action={updateSettingsAction} className="max-w-xl space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Google Analytics 4 ID</label>
          <input name="ga4_id" defaultValue={settings.ga4_id ?? ""} placeholder="G-XXXXXXXXXX" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Google Tag Manager ID</label>
          <input name="gtm_id" defaultValue={settings.gtm_id ?? ""} placeholder="GTM-XXXXXXX" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Google AdSense Client ID</label>
          <input name="adsense_client_id" defaultValue={settings.adsense_client_id ?? ""} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="breaking_ticker_enabled" defaultChecked={settings.breaking_ticker_enabled === "1"} />
          होमपेज पर ब्रेकिंग न्यूज़ टिकर दिखाएँ
        </label>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">संपर्क फोन</label>
          <input name="contact_phone" defaultValue={settings.contact_phone ?? ""} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">संपर्क ईमेल</label>
          <input name="contact_email" defaultValue={settings.contact_email ?? ""} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <SubmitButton
          pendingText="सहेजा जा रहा है…"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          सहेजें
        </SubmitButton>
      </form>
    </div>
  );
}
