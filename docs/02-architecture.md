# Phase 2 — Architecture & Technology Decision

## 1. Technology decision

**Chosen stack: Next.js 14 (App Router, TypeScript) + PostgreSQL + Prisma ORM, deployed as a single self-hosted Node application, with the admin CMS built inside the same app.**

### Why not WordPress (the current stack)?
The existing site is already WordPress. WordPress is a legitimate option and is *not* rejected for fashion reasons — but it's rejected here because:
- Ad-hoc plugin stacks (SEO, ACF, caching, image-opt) become an operational burden for a **small editorial team** — every plugin update is a security/compatibility risk.
- Core Web Vitals on shared WP hosting are hard to keep excellent without significant caching/CDN engineering — exactly the failure mode visible on the current site (generic theme, one ad slot, no evident image pipeline).
- We still preserve everything WordPress was good at (fast authoring, familiar admin UX) by building a **purpose-built, simpler CMS** with only the fields this newspaper actually needs — no plugin sprawl.

### Why not Laravel/PHP+MySQL?
A legitimate, simpler alternative. It was seriously considered. Next.js was chosen instead because:
- **Google News/Discover and Core Web Vitals** are priorities #2–#4 in the brief. Next.js's built-in **Incremental Static Regeneration (ISR)** gives us statically-fast pages (near-instant TTFB, excellent LCP) that still update within seconds of publishing — without hand-rolling a cache-invalidation layer, which a PHP stack would need to build manually (e.g., via Varnish/Redis).
- A single TypeScript codebase for both the public site and the admin panel reduces operational complexity (one deploy, one language, one dependency tree) versus a typical Laravel+Blade admin / separate frontend split.
- Image optimization (`next/image`), route-level metadata APIs, and file-based sitemap/robots generation are first-class in Next.js, directly serving requirements #9 (image optimization) and #13/#14 (Google News/Discover compatibility).

If the editorial team later prefers a WYSIWYG-heavy, non-developer-operated CMS, the database is normalized and decoupled enough (see schema) that a headless swap is possible without rearchitecting the public site.

### Stack summary

| Layer | Choice | Reason |
|---|---|---|
| Frontend + SSR/ISR | **Next.js 14 (App Router, TypeScript, React Server Components)** | SEO-first rendering, ISR for freshness+speed, file-based routing for clean category/article URLs |
| Styling | **Tailwind CSS** | Fast to build a dense, editorial layout without shipping a heavy component library |
| Admin rich-text editor | **Tiptap** (ProseMirror-based) | Full Unicode/Hindi support, headings/lists/images/embeds/tables, outputs clean HTML |
| ORM / DB access | **Prisma** | Type-safe schema, easy migrations, works with Postgres or SQLite (dev) |
| Database | **PostgreSQL** (SQLite for local dev via same schema) | Mature, cheap to host, full-text search (`tsvector`) covers "Search" requirement without needing Elasticsearch on day one |
| Auth | Custom credentials-based auth: **bcrypt password hashing + signed HTTP-only session cookie (JWT via `jose`)** | Full control, no vendor lock-in, small footprint, easy to extend to roles |
| Media storage | Local `/public/uploads` for dev; **S3-compatible object storage** (e.g., Cloudflare R2 / AWS S3) for production, served via CDN | Cheap, standard, works with `next/image` remote patterns |
| Image pipeline | `next/image` (AVIF/WebP auto-negotiation, responsive `sizes`, lazy-loading by default) + `sharp` for admin-side thumbnail generation on upload | Directly satisfies image/perf requirements |
| Search | PostgreSQL full-text search (`tsvector` + GIN index) on title/body/tags, Hindi handled via `simple` text-search config (language-agnostic tokenization) | Sufficient at current scale; swappable for OpenSearch later without touching the public API surface |
| CDN | Any CDN in front of the app (Cloudflare recommended) for static assets + edge caching of ISR pages | Reduces TTFB globally, cheap |
| Hosting | Any Node-capable host (VPS + PM2/Docker, or a PaaS) | Next.js standalone output runs anywhere Node runs — low lock-in |
| Analytics/Ads | GA4, GTM, Search Console via configurable script slots in Settings; AdSense/GPT via configurable `Advertisement`/`AdSlot` records | No source changes needed to update tracking IDs or ad code |

---

## 2. Application architecture

```
                     ┌────────────────────┐
      Reader/Browser │        CDN         │  (static assets, ISR page cache)
                     └─────────┬──────────┘
                               │
                     ┌─────────▼──────────┐
                     │   Next.js App       │  Public site (SSR/ISR) + Admin CMS (SSR, auth-gated)
                     │  (Node runtime)      │
                     └───┬─────────┬───────┘
                         │         │
              ┌──────────▼──┐   ┌──▼─────────────┐
              │ PostgreSQL  │   │ Object Storage   │  (images: originals + generated sizes)
              │ (Prisma)    │   │ (S3/R2) + CDN     │
              └─────────────┘   └────────────────┘

Admin flow:
Admin (browser) → /admin/login (credentials) → session cookie
      → /admin/articles/new → upload image (→ object storage) → save draft (DB)
      → publish → revalidate homepage/category/sitemap (Next.js on-demand ISR revalidation)
      → article live at /{category}/{slug}
```

---

## 3. Database schema (Prisma models, summarized)

Core tables and key relationships:

- **User** (id, name, email, passwordHash, role[SUPER_ADMIN|EDITOR|REPORTER], active, createdAt) — 1 → many Article (as author), 1 → many AuditLog.
- **Category** (id, name, hindiName, slug, description, image, parentId → self-relation for district hierarchy, displayOrder, seoTitle, seoDescription, active) — self-referencing for **राज्य → मंडल → जिला → तहसील** hierarchy. 1 → many Article.
- **Tag** (id, name, slug) — many-to-many with Article via **ArticleTag**.
- **Article** (id, title, hindiTitle, slug, excerpt, bodyHtml, featuredImageId → Media, imageCaption, categoryId, authorId, location, publishedAt, updatedAt, status[DRAFT|SCHEDULED|PUBLISHED|UNPUBLISHED|ARCHIVED], isFeatured, isBreaking, isTrending, isEditorsPick, seoTitle, seoDescription, seoKeywords, canonicalUrl, socialImageId, viewCount).
- **Media** (id, filename, url, width, height, altText, caption, uploadedById, createdAt) — used by Article.featuredImage, Article.socialImage, and inline editor images.
- **Advertisement** (id, name, slotId → AdSlot, device[DESKTOP|TABLET|MOBILE|ALL], codeType[ADSENSE|GPT|HTML|IMAGE], code/html, imageUrl, linkUrl, startDate, endDate, active, priority).
- **AdSlot** (id, key e.g. `HOME_HERO_TOP`, label, description, active) — admin can add new slot keys without code changes to the *data model* (rendering still requires a matching `<AdSlot slotKey="...">` placement in a template, which is intentional — arbitrary slot injection into arbitrary DOM positions is out of scope for v1 and is a placement/AB-testing feature, not a security concern).
- **Setting** (key, value JSON) — GA4 ID, GTM ID, AdSense client ID, site-wide toggles (breaking news ticker on/off), social links, contact info.
- **ArticleView** (articleId, date, count) — daily rollup for "most viewed" without hammering the Article row on every pageview.
- **AuditLog** (id, userId, action, entityType, entityId, meta JSON, createdAt) — records publish/unpublish/delete/role-change events.
- **RedirectRule** (id, fromPath, toPath, statusCode default 301, active) — implements the URL-migration strategy in-app (see Migration section) instead of only in web-server config, so editors can add redirects without a deploy.

Relationships in one line: `User 1—n Article`, `Category 1—n Article`, `Category 1—n Category (parent/children)`, `Article n—n Tag`, `Media 1—n Article (featured/social)`, `AdSlot 1—n Advertisement`, `User 1—n AuditLog`.

---

## 4. Advertisement slot map

Derived from the research (Jagran's explicit between-rail ad markers, Bhaskar's sidebar/rail structure, and standard IAB sizes). All slots are **data-driven** (`AdSlot` + `Advertisement` tables) — nothing is hard-coded; admins can activate/deactivate per slot and per device.

| Slot key | Placement | Devices | Typical size |
|---|---|---|---|
| `HEADER_TOP_LEADERBOARD` | Above header, full width | desktop/tablet | 970×90 / 728×90 |
| `HEADER_MOBILE_BANNER` | Below logo, mobile header | mobile | 320×50 |
| `HOME_BELOW_NAV` | Below main navigation, above breaking ticker | all | 970×90 / 320×100 |
| `HOME_BELOW_BREAKING` | Between breaking-news ticker and hero section | all | 728×90 / 300×250 |
| `HOME_BELOW_HERO` | Between hero grid and Latest News rail | all | 970×250 / 300×250 |
| `HOME_BETWEEN_SECTIONS` (repeatable) | Between every homepage category rail (उत्तर प्रदेश, अपना जिला, देश, क्राइम, …) | all | 728×90 / 300×250 |
| `SIDEBAR_TOP` | Right sidebar, first slot (desktop only, sticky) | desktop/tablet | 300×250 |
| `SIDEBAR_STICKY` | Right sidebar, sticky-on-scroll | desktop | 300×600 |
| `ARTICLE_TOP` | Below headline/meta, above hero image | all | 728×90 / 300×250 |
| `ARTICLE_IN_CONTENT` (repeatable, every ~4 paragraphs) | In-content, native reading flow | all | 300×250 / fluid |
| `ARTICLE_BOTTOM` | After article body, before related stories | all | 728×90 / 300×250 |
| `ARTICLE_SIDEBAR` | Sidebar alongside article body | desktop/tablet | 300×250, 300×600 |
| `RELATED_CONTENT_NATIVE` | Inside "Related/Recommended" grid, native ad card | all | card-shaped |
| `MOBILE_STICKY_BOTTOM` | Fixed bottom bar | mobile | 320×50 / 300×50 |
| `DESKTOP_STICKY_FOOTER` | Fixed bottom bar | desktop | 728×90 |
| `CATEGORY_TOP` | Top of category listing page | all | 970×90 / 300×250 |
| `CATEGORY_IN_GRID` (repeatable every N cards) | Inside category card grid | all | card-shaped |
| `FOOTER_TOP` | Above footer | all | 970×250 / 300×250 |

Engineering safeguards baked into the `AdSlot`/`Advertisement` components:
- Reserved-space containers (fixed `min-height` per slot) to prevent **CLS**.
- `next/dynamic` + `IntersectionObserver`-based lazy loading for below-the-fold slots.
- A slot renders **nothing** (not even a placeholder box) if no active `Advertisement` matches today's date range/device — no fake ad boxes ever ship, satisfying the "do not hard-code fake ads" requirement.
- Sticky mobile/desktop slots include a close ("✕") control and a frequency cap (`localStorage` dismissal per session) to protect UX and align with Google's Better Ads Standards for sticky units.

---

## 5. SEO & structured-data architecture

- Clean URLs: `/{categorySlug}/{articleSlug}` (no date segment). Slugs are **transliterated/ASCII** by default (auto-generated from the Hindi title via a transliteration+slugify step in the editor, editable by the author) — chosen over raw-Hindi-encoded slugs because it avoids the extremely long, encoded URLs seen on the current site, while still allowing an editor to override the slug per article if a Hindi slug is preferred for a specific piece.
- Per-article `generateMetadata()` emits: title, meta description, canonical URL, Open Graph (`og:type=article`, image, published/modified time), Twitter Card.
- JSON-LD emitted per page: `NewsArticle` (headline, image, datePublished, dateModified, author, publisher w/ logo, mainEntityOfPage) on article pages; `BreadcrumbList` on article/category pages; `Organization` + `WebSite` (with `SearchAction`) on the homepage via root layout.
- `/sitemap.xml` (index) → per-category sitemap chunks, generated from published articles (Next.js `sitemap.ts` route).
- `/news-sitemap.xml` — Google News sitemap format (`<news:news>` with publication name, language `hi`, genres, keywords), limited to articles published in the last 48 hours, per Google News sitemap spec.
- `/robots.txt` — allow all, reference both sitemaps, disallow `/admin`.
- We make **no claim of guaranteed Google News/Discover inclusion** — only that the technical prerequisites (valid NewsArticle markup, fast pages, unique original content, no interstitial abuse) are met.

---

## 6. Content migration & URL strategy

1. Export existing WordPress content via WP REST API / XML export (title, hindi title = same field today, body, category, publish date, featured image URL, author="admin").
2. Import into the new `Article`/`Category`/`Media` tables via a one-time migration script, mapping old category slugs (`national`, `our-district`, `uttarpradesh`, `sonbhadra`, `crime`, …) onto the new, cleaned-up `Category` tree (fixing the observed inconsistency where Sonbhadra news was filed under `national`, by keyword/tag-assisted reclassification during import, reviewed by an editor before publish).
3. Old images are re-hosted into the new Media/object-storage pipeline (re-encoded to WebP/AVIF, thumbnails generated).
4. For every migrated article, insert a **`RedirectRule`**: `/DD/MM/YYYY/<old-category>/<old-encoded-slug>/` → `/{newCategorySlug}/{newSlug}` (301). The old date-based path is still parseable (day/month/year + slug), so redirects can be generated programmatically from the import mapping table — no manual URL mapping needed.
5. Redirects are served from Next.js middleware, checking `RedirectRule` first (DB-backed) before falling through to the normal route — so editors can add ad-hoc redirects later without a code deploy.
6. Submit updated `sitemap.xml`/`news-sitemap.xml` to Search Console and Google Publisher Center after cutover; monitor Search Console's "Page with redirect"/404 reports for the following weeks.

---

## 7. Security strategy

- Passwords: `bcrypt` (cost 12), never stored/logged in plaintext.
- Sessions: HTTP-only, `Secure`, `SameSite=Lax` cookie holding a signed JWT (short expiry + refresh), no session data in localStorage.
- CSRF: same-site cookies + explicit origin check on all admin mutating routes (Next.js Server Actions/Route Handlers validate `Origin`/`Referer`).
- XSS: article body HTML is authored via Tiptap (structured JSON → sanitized HTML render with an allow-list sanitizer, e.g. `sanitize-html`, both on save and on render) — never `dangerouslySetInnerHTML` of raw untrusted input. Custom "Advertisement" HTML/JS fields are **admin-only** (SUPER_ADMIN/EDITOR), rendered in a **sandboxed `<iframe>`** where feasible for third-party ad code, never eval'd inline.
- SQL injection: Prisma parameterizes all queries; no raw string concatenation for SQL.
- File upload validation: MIME-type allow-list (jpeg/png/webp/gif), max size limit, re-encoding via `sharp` (strips EXIF/malicious payloads), random filenames, stored outside of directly-executable paths.
- Rate limiting: login route and public search/comment-style endpoints rate-limited per IP (e.g. token-bucket in middleware / edge).
- RBAC: `SUPER_ADMIN` (all), `EDITOR` (create/edit/publish articles, manage categories/tags), `REPORTER` (create/edit own drafts, upload media, cannot publish) — enforced server-side on every mutating route, not just hidden in the UI.
- Secure admin URL: `/admin/*`, not indexable (`robots.txt` disallow + `noindex` meta), plus normal auth gate.
- Audit logging: publish/unpublish/delete/role-change actions written to `AuditLog`.

---

## 8. What is intentionally deferred (not v1)

To avoid over-engineering per the brief: Elasticsearch/OpenSearch (Postgres FTS is sufficient at current scale), video/web-stories formats, multi-brand portfolio nav, AMP, native mobile apps, e-Paper. The schema and architecture do not block adding these later.
