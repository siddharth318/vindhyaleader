import { getAdSenseConfig } from "@/lib/adsense";

export const revalidate = 3600;

/**
 * /ads.txt — declares Google as an authorised seller of this site's ad space. AdSense flags the
 * site ("Earnings at risk") and may limit ads until this file is served from the root domain.
 * f08c47fec0942fa0 is Google's fixed certification-authority ID.
 */
export async function GET() {
  const { client } = await getAdSenseConfig();
  const body = client ? `google.com, ${client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n` : "";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
