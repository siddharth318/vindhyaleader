import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Hind, Baloo_2 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdSlot from "@/components/ads/AdSlot";
import { getSettings } from "@/lib/data/settings";

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const hind = Hind({
  variable: "--font-hind",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
});

const baloo = Baloo_2({
  variable: "--font-brand",
  subsets: ["devanagari", "latin"],
  weight: ["600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "विंध्यलीडर | Vindhya Leader — आपकी अपनी आवाज़",
    template: "%s | विंध्यलीडर",
  },
  description:
    "विंध्यलीडर — आपकी अपनी आवाज़। सोनभद्र, विंध्य क्षेत्र, उत्तर प्रदेश और देश-दुनिया की ताज़ा हिंदी खबरें, राजनीति, क्राइम, खेल, मनोरंजन और अधिक।",
  openGraph: {
    type: "website",
    siteName: "विंध्यलीडर",
    locale: "hi_IN",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { ga4_id: ga4Id, gtm_id: gtmId } = await getSettings(["ga4_id", "gtm_id"]).catch(() => ({
    ga4_id: null,
    gtm_id: null,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "विंध्यलीडर",
        alternateName: "Vindhya Leader",
        slogan: "आपकी अपनी आवाज़",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
      },
      {
        "@type": "WebSite",
        name: "विंध्यलीडर",
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang="hi"
      className={`${notoDevanagari.variable} ${hind.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {gtmId && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
        {ga4Id && !gtmId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', '${ga4Id}');`}
            </Script>
          </>
        )}
        <AdSlot slotKey="HEADER_TOP_LEADERBOARD" label="विज्ञापन" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
