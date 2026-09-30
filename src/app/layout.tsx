import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Hind, Baloo_2 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdSlot from "@/components/ads/AdSlot";
import { getSettings } from "@/lib/data/settings";
import {
  DEFAULT_OG_IMAGE,
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE,
  SITE_KEYWORDS,
  SITE_URL,
  organizationJsonLd,
} from "@/lib/seo";

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

const siteUrl = SITE_URL;

export async function generateMetadata(): Promise<Metadata> {
  const verify = await getSettings(["google_site_verification", "bing_site_verification"]).catch(
    () => ({}) as Record<string, string | null>
  );

  return {
    metadataBase: new URL(siteUrl),
    title: { default: HOME_TITLE, template: `%s | ${SITE.nameHi}` },
    description: HOME_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    applicationName: SITE.nameHi,
    authors: [{ name: SITE.nameHi, url: siteUrl }],
    publisher: SITE.nameHi,
    category: "news",
    openGraph: {
      type: "website",
      siteName: SITE.nameHi,
      locale: SITE.locale,
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESCRIPTION, images: [DEFAULT_OG_IMAGE.url] },
    // Large image previews are required for Google Discover / Top Stories thumbnails.
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    verification: {
      google: verify.google_site_verification || undefined,
      other: verify.bing_site_verification ? { "msvalidate.01": verify.bing_site_verification } : undefined,
    },
    // Local-relevance hints for the publisher's home town.
    other: {
      "geo.region": "IN-UP",
      "geo.placename": "Robertsganj, Sonbhadra, Uttar Pradesh",
      "geo.position": `${SITE.geo.latitude};${SITE.geo.longitude}`,
      ICBM: `${SITE.geo.latitude}, ${SITE.geo.longitude}`,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { ga4_id: ga4Id, gtm_id: gtmId } = await getSettings(["ga4_id", "gtm_id"]).catch(() => ({
    ga4_id: null,
    gtm_id: null,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: SITE.nameHi,
        alternateName: SITE.alternateNames,
        url: siteUrl,
        inLanguage: SITE.language,
        publisher: { "@id": `${siteUrl}/#organization` },
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
