# Phase 1 — Research Report

Research conducted by live inspection (via automated fetch) of the four target sites on 2026-09-19. Findings are split into **Observed facts** and **Recommendations** as required.

---

## 1. Existing site — vindhyaleader.com

**Observed facts:**
- Built on **WordPress** (evidence: `/author/admin/` author archive URLs, `/category/<slug>/` taxonomy URLs, `wp`-style comment counters `#respond`, a "Newsletter Signup"/"Enable Notifications" push-widget, and a `spot_img` placeholder div commonly emitted by the **Newspaper/Jannah-style WP news themes**).
- **Permalink structure:** date-based — `/DD/MM/YYYY/<category-slug>/<url-encoded-hindi-title-slug>/`. Slugs are the **raw Hindi title, URL-encoded** (not transliterated), which produces very long, encoded URLs.
- **Categories in use (from nav + footer):** होम, देश (national), विदेश (international), क्राइम (crime), राजनीति (politics), राज्य (state), टेक्नोलॉजी, शिक्षा (education), स्वास्थ्य (health), स्पोर्ट्स (sports), धर्म (dharma), मनोरंजन (entertainment), राशिफल (rashifal).
- **Local/geo taxonomy (footer):** अपना जिला → गाजीपुर, चंदौली, मिर्जापुर, वाराणसी, सोनभद्र. राज्य → उत्तरप्रदेश, मध्यप्रदेश, बिहार, झारखण्ड, छत्तीसगढ़. There are also `our-district` and `sonbhadra` category slugs used inconsistently alongside `uttarpradesh`/`national` for what is clearly local news — i.e. **categorization is inconsistent today** (many Sonbhadra-specific stories are filed under `national`).
- Homepage is a single long river of cards grouped by category heading (क्राइम, देश, विदेश, अपना जिला, सोनभद्र, राजनीती, स्वास्थ्य, खेलकूद, शिक्षा, मनोरंजन, राशिफल) — a typical WP "Homepage News Grid" theme layout, not a true multi-zone editorial homepage.
- Byline is generic "admin" on nearly every article — no real author/reporter identity system in place.
- A single sidebar ad slot (`spot_img`) placeholder was detected; no visible structured ad-slot system.
- Footer has "विज्ञापन हेतु कॉल करें" (call for advertising) with a phone number — confirms direct/manual ad sales is the current monetization model, not programmatic ad tech.
- Basic WP login/"Sign in" widget exists (default WP `wp-login` style form), Privacy Policy and Contact Us pages exist. No visible cookie consent, HTTPS-only badges, or AMP tagging observed.

**Recommendation:** Treat this as a **modernization**, not a rebuild-from-zero. We must preserve category taxonomy value and old URLs (301 redirect map, see Migration section) while fixing: inconsistent categorization, non-transliterated slugs, single generic ad slot, and lack of real author identity.

---

## 2. Amar Ujala (amarujala.com)

**Observed facts:**
- Extremely **high information density** homepage — dozens of headline links above the fold, grouped in a numbered "top list" (position=1..20+) plus multiple themed rails (Bollywood, Cricket, India News, Astrology/Jyotish cross-sell).
- Clean, **transliterated-English slugs** in URLs even though headlines are Hindi, e.g. `/india-news/lpg-cylinders-subsidy-...-2026-09-19`. Pattern: `/<section>/<slug>-<yyyy-mm-dd>`. This is far more SEO/URL-friendly than raw Hindi encoding.
- Every headline carries visible **category + published date + reaction/engagement icon** inline — strong metadata-forward card design.
- Cross-sell of sister products in nav/footer (My Jyotish, Gaon Junction, e-Paper editions per city) — a portfolio/hub model.
- Uses a **"Follow us on Google News" preferred-source CTA**, RSS feeds, sitemap.html, city-wise e-Paper links — all strong Google News/Discover signals.
- Heavy social share plumbing per card (Facebook/WhatsApp deep links generated per article).
- Ads: policy/legal pages exist (`/advertise-with-us`), but exact in-page ad slot count wasn't visible in the text-extraction (ads are rendered client-side / iframe, consistent with GAM/AdSense-style slot placement that a text-mode fetch can't fully see). This is expected — it does **not** mean no ads exist.

**Recommendation:** Adopt the transliterated-slug + date-suffix URL pattern idea (optional), the metadata-forward card (category chip + timestamp), and the "numbered top rail + themed rails" homepage density model, scaled down appropriately for a regional paper.

---

## 3. Dainik Jagran (jagran.com)

**Observed facts:**
- Very large **primary nav** (20+ items: ताज़ा, ब्रेकिंग, राष्ट्रीय, दुनिया, राशिफल, बिजनेस, क्रिकेट, मनोरंजन, फोटो-स्टोरीज़, अध्यात्म, लाइफस्टाइल, टेक-ज्ञान, ऑटो, पॉलिटिक्स, Did You Know, एक्सप्लेनर, लाइव न्यूज़, शिक्षा, जॉब्स, कैरियर, वायरल) plus a secondary "फोकस" campaign-link row.
- Dedicated **"ब्रेकिंग न्यूज़" (breaking news) module** as its own homepage rail, separate from "ताजा खबरें" (latest).
- Distinct content rails by **content type**, not just category: "एक्सप्लेनर" (explainers), "क्या आप जानते हैं?" (Did You Know / evergreen), "राशिफल" (horoscope), each with their own heading and card style.
- Timestamps shown as **relative time** ("40 MINS AGO", "AN HOUR AGO") on the latest-news list — a UX pattern worth adopting for freshness perception.
- Explicit `विज्ञापन हटाएं/सिर्फ खबर पढ़ें ADVERTISEMENT` (dismiss-ad / read-only-news) markers appear **between every content rail** — confirms **ads are inserted between homepage sections systematically**, not randomly.
- Portfolio of sister sites in header (Naidunia, Jagran Josh, Her Zindagi, OnlyMyHealth, Jagran TV, Vishvas News, iNext Live) — multi-vertical publisher network.
- Sitemap/robots/AMP-like patterns implied by Google News "Follow us" CTA.

**Recommendation:** The clearest evidence among all three references of **systematic ad-slot placement between homepage rails** comes from Jagran (explicit "ADVERTISEMENT" markers between every section). This directly informs our ad-slot map (Section "Advertisement Map").

---

## 4. Dainik Bhaskar (bhaskar.com)

**Observed facts:**
- Homepage organized by **state-wise rail** ("राज्यवार खबरें": UP, MP, Rajasthan, Chhattisgarh, Jharkhand, Bihar, Haryana, Punjab, Chandigarh, HP, Uttarakhand, Delhi, Maharashtra, Gujarat) — strongly local/geo-first information architecture, very relevant to Vindhya Leader's district-first strategy.
- Separate **"Trending Topics"** tag-cloud rail, distinct from category nav — a lightweight topic/tag system surfaced on the homepage.
- Category-icon system: each section (Entertainment, International, National, Business, DB Original, Lifestyle, Jobs & Education) has a **small icon badge** next to its rail heading — reinforces visual category identity at a glance.
- **"Today Weather Update"** city-wise rail on the homepage — hyperlocal utility content, a differentiator versus generic national portals.
- Explicit `Google Preferred Source` CTA and multi-brand network (Divya Bhaskar, Divya Marathi, Money Bhaskar, Bhaskar English) footer links.
- Legal footer explicitly states adherence to the **DNPA Code of Ethics** — a real, citable Indian digital-news self-regulation code worth linking to from our own footer/about page.
- Video/"वॉच"/"वेब स्टोरीज"/ई-पेपर nav items — confirms video and web-story formats are standard for major Hindi portals (a future-phase feature for us, not MVP).

**Recommendation:** Adopt the **state → district rail model** as the backbone of Vindhya Leader's homepage local-news section (उत्तर प्रदेश → सोनभद्र → तहसील), and adopt lightweight tags for a "trending topics" rail.

---

## 5. Cross-cutting patterns observed across all three major portals

| Pattern | AU | Jagran | Bhaskar | Adopt for विंध्यलीडर? |
|---|---|---|---|---|
| Category chip + date on every card | ✅ | ✅ | ✅ | Yes |
| Dedicated Breaking News rail | ✅ | ✅ | ✅ | Yes (ticker + section) |
| State/district rails | partial | partial | ✅ strong | Yes — core to our local-first strategy |
| Explainer / Did-You-Know evergreen rail | – | ✅ | – | Optional, phase 2 |
| Rashifal/astrology rail | ✅ | ✅ | ✅ | Yes (small, low priority) |
| Ads between every homepage rail | implied | explicit | implied | Yes — core requirement |
| Social share buttons per card | ✅ | – | – | Yes, on article page primarily |
| Sister-site / portfolio nav | ✅ | ✅ | ✅ | No (single-title publisher) |
| Google News "preferred source" CTA | – | – | ✅ | Yes, low cost to add |
| Sitemap / RSS / e-Paper links in footer | ✅ | ✅ | ✅ | Sitemap + RSS yes; e-Paper is out of scope |

---

## 6. Technology stack — what is verifiable vs. assumed

No reliable public engineering blog / job-posting citation was retrieved in this research pass confirming the exact backend stack of Amar Ujala, Jagran, or Bhaskar (this would require deeper OSINT — e.g. BuiltWith/Wappalyzer scans, job listings, engineering blogs — beyond what page-content fetching can confirm). What **is** directly observable from the fetched HTML/behavior and is stated here as fact, not guess:

- All three sites are **server-rendered, non-SPA** article/listing pages (content is present in the initial HTML, not injected purely client-side) — consistent with SSR or static-generation approaches optimized for SEO/crawlers.
- All three use **CDN-hosted image assets** on dedicated image subdomains/paths (e.g. `userimg.amarujala.com`, `jagranimages.com`, `images.bhaskarassets.com`) with `/webp/thumb/<size>/...` style paths on Bhaskar — i.e. **on-the-fly responsive image resizing via URL convention**, served from a dedicated asset host/CDN.
- All three ship heavy ad/analytics/social JS but keep the **core article text crawlable without JS** — a strong signal that Core Web Vitals / crawlability for the primary content is treated as a hard requirement, whatever framework renders the shell.

We do **not** claim to know their specific CMS, database, or cloud vendor — that would be an unverified assumption and is explicitly excluded per the instructions. Our own stack decision (Phase 2) is chosen independently on first-principles suited to a small editorial team, not by imitation.
