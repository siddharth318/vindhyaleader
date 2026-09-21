"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, hasRole } from "@/lib/auth";
import { setSetting } from "@/lib/data/settings";

export async function updateSettingsAction(formData: FormData) {
  const session = await getSession();
  if (!hasRole(session, "SUPER_ADMIN")) redirect("/admin/login");

  const entries: [string, string][] = [
    ["ga4_id", String(formData.get("ga4_id") ?? "")],
    ["gtm_id", String(formData.get("gtm_id") ?? "")],
    ["adsense_client_id", String(formData.get("adsense_client_id") ?? "")],
    ["breaking_ticker_enabled", formData.get("breaking_ticker_enabled") === "on" ? "1" : "0"],
    ["contact_phone", String(formData.get("contact_phone") ?? "")],
    ["contact_email", String(formData.get("contact_email") ?? "")],
  ];

  for (const [key, value] of entries) {
    await setSetting(key, value);
  }

  revalidatePath("/admin/settings");
}
