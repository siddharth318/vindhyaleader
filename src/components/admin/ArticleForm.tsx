"use client";

import { useState } from "react";
import RichTextEditor from "./RichTextEditor";
import SubmitButton from "./SubmitButton";
import Spinner from "@/components/Spinner";
import { uploadEditorImageAction } from "@/lib/actions/media-actions";

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
    featuredImageUrl?: string | null;
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
  const [featuredImageId, setFeaturedImageId] = useState(article?.featuredImageId ?? "");
  const [featuredImageAutoSet, setFeaturedImageAutoSet] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(
    article?.featuredImageUrl ??
      (article?.featuredImageId ? (media.find((m) => m.id === article.featuredImageId)?.url ?? null) : null)
  );
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const handleImageUploaded = (mediaId: string, url: string) => {
    // Only auto-fill if the user hasn't already chosen a cover (either from the
    // existing article, or by uploading one from the device in this session).
    setFeaturedImageId((current) => {
      if (current && !featuredImageAutoSet) return current;
      setFeaturedImageAutoSet(true);
      setCoverUrl(url);
      return mediaId;
    });
  };

  // Manual cover upload from the user's device. This is an explicit choice, so
  // it wins over any image in the body — the body image can stay in the body
  // but won't be used as the cover.
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setCoverError(null);
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadEditorImageAction(formData);
      if ("url" in result) {
        setFeaturedImageAutoSet(false); // explicit pick — don't let a body paste override it
        setFeaturedImageId(result.id);
        setCoverUrl(result.url);
      } else {
        setCoverError(result.error);
      }
    } catch {
      setCoverError("Upload failed. Please try again.");
    } finally {
      setCoverUploading(false);
    }
  };

  const clearCover = () => {
    setFeaturedImageAutoSet(false);
    setFeaturedImageId("");
    setCoverUrl(null);
  };

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
          <RichTextEditor name="bodyHtml" initialContent={article?.bodyHtml} onImageUploaded={handleImageUploaded} />
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
          <h3 className="mb-3 font-semibold">Publishing</h3>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Status</label>
          <select
            name="status"
            defaultValue={article?.status ?? "DRAFT"}
            className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {isSuperAdmin ? (
              <>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
                <option value="UNPUBLISHED">Unpublished</option>
                <option value="ARCHIVED">Archived</option>
              </>
            ) : (
              <>
                <option value="DRAFT">Save as Draft</option>
                <option value="PENDING_REVIEW">Send to Super Admin for review</option>
              </>
            )}
          </select>
          {!isSuperAdmin && (
            <p className="mb-3 text-xs text-neutral-400">
              Super Admin approval is required before publishing. Choosing &ldquo;Send for review&rdquo; puts this story
              in the Super Admin&apos;s review list.
            </p>
          )}

          <div className="space-y-1.5 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" defaultChecked={article?.isFeatured} /> Featured</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="isBreaking" defaultChecked={article?.isBreaking} /> Breaking News</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="isTrending" defaultChecked={article?.isTrending} /> Trending</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="isEditorsPick" defaultChecked={article?.isEditorsPick} /> Editor&apos;s Pick</label>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="mb-3 font-semibold">Category &amp; Meta</h3>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Category *</label>
          <select name="categoryId" required defaultValue={article?.categoryId} className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm">
            <option value="">-- Select --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.hindiName}</option>
            ))}
          </select>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Location (City/District)</label>
          <input name="location" defaultValue={article?.location ?? ""} className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          <label className="mb-1 block text-sm font-medium text-neutral-700">Tags (comma separated)</label>
          <input name="tags" defaultValue={article?.tags ?? ""} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h3 className="mb-3 font-semibold">Featured / Cover Image</h3>

          {/* Submitted with the form; kept in sync by the device upload or a body-image auto-select. */}
          <input type="hidden" name="featuredImageId" value={featuredImageId} />

          {coverUrl ? (
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="Cover preview" className="mb-2 aspect-[16/9] w-full rounded-md object-cover" />
              <button
                type="button"
                onClick={clearCover}
                className="text-xs text-red-700 hover:underline"
              >
                Remove cover
              </button>
            </div>
          ) : (
            <div className="mb-3 flex aspect-[16/9] w-full items-center justify-center rounded-md border border-dashed border-neutral-300 text-xs text-neutral-400">
              No cover image
            </div>
          )}

          {/* Upload a cover straight from the device. Explicit choice — wins over any body image. */}
          <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
            {coverUploading ? <Spinner className="h-4 w-4 text-red-700" /> : <span>⬆️</span>}
            {coverUploading ? "Uploading…" : "Upload cover from device"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={coverUploading}
              onChange={handleCoverUpload}
            />
          </label>
          {coverError && <p className="mb-3 text-xs text-red-700">{coverError}</p>}
          <p className="mb-3 text-xs text-neutral-400">
            Upload a cover from your device — otherwise the first image in the body automatically becomes the cover.
          </p>

          <label className="mb-1 block text-sm font-medium text-neutral-700">Image Caption</label>
          <input name="imageCaption" defaultValue={article?.imageCaption ?? ""} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        </div>

        <SubmitButton pendingText="सहेजा जा रहा है…" overlay>सहेजें</SubmitButton>
      </div>
    </form>
  );
}
