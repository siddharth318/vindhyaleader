import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/Logo";

// Publisher logo referenced by the Organization / NewsArticle structured data.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(<LogoMark size={512} instanceId="logo-png" />, { width: 512, height: 512 });
}
