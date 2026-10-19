"use server";

import { getSession, hasRole } from "@/lib/auth";
import { facebookShareLink, parseFacebookVideo, type FacebookEmbed } from "@/lib/video";
import { resolveFacebookShare } from "@/lib/facebook-resolve";

/**
 * Editor's "📘 Facebook वीडियो" button: turns a pasted link/embed code into a playable embed.
 * Direct video/reel links are handled instantly; share links are followed to the real video here,
 * on the server (the browser can't read Facebook's redirects).
 */
export async function resolveFacebookVideoAction(input: string): Promise<FacebookEmbed | { error: string }> {
  const session = await getSession();
  if (!hasRole(session, "REPORTER")) return { error: "अनधिकृत — कृपया दोबारा लॉगिन करें।" };

  const direct = parseFacebookVideo(input);
  if (direct) return direct;

  const share = facebookShareLink(input);
  if (!share) {
    return { error: "यह Facebook वीडियो का लिंक नहीं लग रहा। Facebook पर वीडियो खोलकर उसका लिंक (URL) कॉपी करके यहाँ पेस्ट करें।" };
  }
  try {
    const embed = await resolveFacebookShare(share);
    if (embed) return embed;
  } catch {
    return { error: "Facebook से लिंक की जाँच नहीं हो सकी — थोड़ी देर बाद दोबारा कोशिश करें।" };
  }
  return { error: "इस लिंक से वीडियो नहीं मिला। हो सकता है वीडियो Public न हो, या यह किसी पोस्ट का लिंक हो — वीडियो खोलकर उसका लिंक कॉपी करें।" };
}
