import RichTextEditor from "./RichTextEditor";

type CategoryOption = { id: string; hindiName: string };
type MediaOption = { id: string; filename: string; url: string };

export default function ArticleForm({
  action,
  categories,
  media,
  article,
  isSuperAdmin,
}: {
  action: (formData: FormData) => void;
  categories: CategoryOption[];
  media: MediaOption[];
  isSuperAdmin: boolean;
  article?: {
    title: string;
    hindiTitle: string;
    slug: string;
    excerpt: string | null;
    bodyHtml: string;
    categoryId: string;
    location: string | null;
    featuredImageId: string | null;
    imageCaption: string | null;
    status: string;
    isFeatured: boolean;
    isBreaking: boolean;
    isTrending: boolean;
    isEditorsPick: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
    canonicalUrl: string | null;
    tags?: string;
  };
}) {
  return (
    <form action={action} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">हिंदी शीर्षक *</label>
          <input
            name="hindiTitle"
            required
            defaultValue={article?.hindiTitle}
            className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-lg font-semibold outline-none focus:border-red-700"
          />
          <label className="mb-1 block text-sm font-medium text-neutral-700">Working Title (slug आधार हेतु)</label>
          <input
            name="title"
            defaultValue={article?.title}
            className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-700"
          />
          <label className="mb-1 block text-sm font-medium text-neutral-700">Slug (खाली छोड़ें तो स्वतः बनेगा)</label>
          <input
            name="slug"
            defaultValue={article?.slug}
            className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-700"
          />
          <label className="mb-1 block text-sm font-medium text-neutral-700">संक्षिप्त विवरण</label>
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={article?.excerpt ?? ""}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-700"
          />
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-neutral-700">आर्टिकल बॉडी *</label>
          <RichTextEditor name="bodyHtml" initialContent={article?.bodyHtml} />
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="mb-3 font-semibold">SEO</h3>
          <label className="mb-1 block text-sm font-medium text-neutral-700">SEO शीर्षक</label>
          <input name="seoTitle" defaultValue={article?.seoTitle ?? ""} className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          <label className="mb-1 block text-sm font-medium text-neutral-700">SEO विवरण</label>
          <textarea name="seoDescription" rows={2} defaultValue={article?.seoDescription ?? ""} className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          <label className="mb-1 block text-sm font-medium text-neutral-700">SEO कीवर्ड्स (कॉमा से अलग)</label>
          <input name="seoKeywords" defaultValue={article?.seoKeywords ?? ""} className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          <label className="mb-1 block text-sm font-medium text-neutral-700">Canonical URL</label>
          <input name="canonicalUrl" defaultValue={article?.canonicalUrl ?? ""} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="mb-3 font-semibold">प्रकाशन</h3>
          <label className="mb-1 block text-sm font-medium text-neutral-700">स्थिति</label>
          <select
            name="status"
            defaultValue={article?.status ?? "DRAFT"}
            className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {isSuperAdmin ? (
              <>
                <option value="DRAFT">ड्राफ्ट</option>
                <option value="PENDING_REVIEW">समीक्षा हेतु लंबित</option>
                <option value="SCHEDULED">निर्धारित</option>
                <option value="PUBLISHED">प्रकाशित</option>
                <option value="UNPUBLISHED">अप्रकाशित</option>
                <option value="ARCHIVED">संग्रहीत</option>
              </>
            ) : (
              <>
                <option value="DRAFT">ड्राफ्ट के रूप में सहेजें</option>
                <option value="PENDING_REVIEW">सुपर एडमिन को समीक्षा हेतु भेजें</option>
              </>
            )}
          </select>
          {!isSuperAdmin && (
            <p className="mb-3 text-xs text-neutral-400">
              प्रकाशन से पहले सुपर एडमिन की स्वीकृति आवश्यक है। "समीक्षा हेतु भेजें" चुनने पर यह खबर सुपर एडमिन की
              समीक्षा सूची में दिखेगी।
            </p>
          )}

          <div className="space-y-1.5 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" defaultChecked={article?.isFeatured} /> फीचर्ड</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="isBreaking" defaultChecked={article?.isBreaking} /> ब्रेकिंग न्यूज़</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="isTrending" defaultChecked={article?.isTrending} /> ट्रेंडिंग</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="isEditorsPick" defaultChecked={article?.isEditorsPick} /> एडिटर्स पिक</label>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="mb-3 font-semibold">श्रेणी और मेटा</h3>
          <label className="mb-1 block text-sm font-medium text-neutral-700">श्रेणी *</label>
          <select name="categoryId" required defaultValue={article?.categoryId} className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm">
            <option value="">-- चुनें --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.hindiName}</option>
            ))}
          </select>
          <label className="mb-1 block text-sm font-medium text-neutral-700">स्थान (शहर/जिला)</label>
          <input name="location" defaultValue={article?.location ?? ""} className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          <label className="mb-1 block text-sm font-medium text-neutral-700">टैग्स (कॉमा से अलग)</label>
          <input name="tags" defaultValue={article?.tags ?? ""} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="mb-3 font-semibold">फ़ीचर्ड इमेज</h3>
          <select name="featuredImageId" defaultValue={article?.featuredImageId ?? ""} className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm">
            <option value="">-- कोई नहीं --</option>
            {media.map((m) => (
              <option key={m.id} value={m.id}>{m.filename}</option>
            ))}
          </select>
          <p className="mb-3 text-xs text-neutral-400">पहले मीडिया लाइब्रेरी में अपलोड करें, फिर यहाँ चुनें।</p>
          <label className="mb-1 block text-sm font-medium text-neutral-700">इमेज कैप्शन</label>
          <input name="imageCaption" defaultValue={article?.imageCaption ?? ""} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>

        <button type="submit" className="w-full rounded-md bg-red-700 py-2.5 font-semibold text-white hover:bg-red-800">
          सहेजें
        </button>
      </div>
    </form>
  );
}
