import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/Logo";

/**
 * Default 1200×630 share card, used whenever a page has no image of its own
 * (homepage, category pages, articles without a cover). Text is English because
 * the image renderer can't shape Devanagari conjuncts/matras correctly.
 */
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 45%, #ea580c 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <LogoMark size={170} instanceId="og" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>Vindhya Leader</div>
            <div style={{ fontSize: 30, marginTop: 14, color: "#fde68a", letterSpacing: 6 }}>AAPKI APNI AAWAZ</div>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 64, fontSize: 44, fontWeight: 700 }}>
          Sonbhadra · Robertsganj · Purvanchal News
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 30, color: "#fed7aa" }}>
          Latest & breaking Hindi news from Sonbhadra, Uttar Pradesh
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
