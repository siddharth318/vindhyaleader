"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import { uploadEditorImageAction } from "@/lib/actions/media-actions";
import { FacebookVideo, Video } from "./tiptap-video";
import { parseFacebookVideo, VIDEO_MAX_BYTES } from "@/lib/video";
import { uploadVideo } from "@/lib/video-upload-client";
import { resolveFacebookVideoAction } from "@/lib/actions/video-actions";

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

/** data: URI -> Blob, so pasted/embedded base64 images can be uploaded like a normal file. */
function dataUriToBlob(dataUri: string): Blob {
  const [header, base64] = dataUri.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm ${active ? "bg-red-700 text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  name,
  initialContent,
  onImageUploaded,
  onVideoUploadingChange,
}: {
  name: string;
  initialContent?: string;
  /** Called with the Media id whenever a pasted/embedded image gets auto-uploaded. */
  onImageUploaded?: (mediaId: string, url: string) => void;
  /** Tells the form when a video upload starts/ends, so it can hold back "save" until it's done. */
  onVideoUploadingChange?: (uploading: boolean) => void;
}) {
  const [html, setHtml] = useState(initialContent || "");
  const [upload, setUpload] = useState<{ name: string; sent: number; total: number } | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [fbOpen, setFbOpen] = useState(false);
  const [fbValue, setFbValue] = useState("");
  const [fbError, setFbError] = useState<string | null>(null);
  const [fbChecking, setFbChecking] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const uploadAbort = useRef<AbortController | null>(null);
  const uploading = upload !== null;
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
      Video,
      FacebookVideo,
      Placeholder.configure({ placeholder: "यहाँ खबर लिखें..." }),
    ],
    content: initialContent || "",
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-neutral max-w-none min-h-[300px] px-3 py-2 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  // Auto-upload any pasted/dropped image embedded as a base64 data: URI (common when
  // pasting from Word/Google Docs) — replaces it with a real hosted URL so it survives
  // sanitization on save and doesn't bloat the article HTML with inline base64 blobs.
  const inFlight = useRef(new Set<string>());
  const onImageUploadedRef = useRef(onImageUploaded);

  useEffect(() => {
    onImageUploadedRef.current = onImageUploaded;
  }, [onImageUploaded]);

  useEffect(() => {
    if (!editor) return;

    const uploadEmbeddedImages = () => {
      const jobs: { pos: number; dataUri: string }[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && typeof node.attrs.src === "string" && node.attrs.src.startsWith("data:")) {
          jobs.push({ pos, dataUri: node.attrs.src });
        }
      });

      for (const { dataUri } of jobs) {
        if (inFlight.current.has(dataUri)) continue;
        inFlight.current.add(dataUri);

        (async () => {
          try {
            const blob = dataUriToBlob(dataUri);
            const formData = new FormData();
            formData.append("file", blob, "pasted-image.png");
            const result = await uploadEditorImageAction(formData);
            if ("url" in result) {
              editor.state.doc.descendants((node, currentPos) => {
                if (node.type.name === "image" && node.attrs.src === dataUri) {
                  editor.view.dispatch(
                    editor.view.state.tr.setNodeAttribute(currentPos, "src", result.url)
                  );
                }
                return true;
              });
              onImageUploadedRef.current?.(result.id, result.url);
            }
          } catch {
            // Leave the data: URI in place on failure — sanitizer will drop it, but the
            // rest of the article still saves.
          } finally {
            inFlight.current.delete(dataUri);
          }
        })();
      }
    };

    editor.on("update", uploadEmbeddedImages);
    uploadEmbeddedImages();
    return () => {
      editor.off("update", uploadEmbeddedImages);
    };
  }, [editor]);

  // Cancel an in-flight video upload if the editor goes away, and warn before leaving mid-upload.
  useEffect(() => () => uploadAbort.current?.abort(), []);
  useEffect(() => {
    if (!uploading) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [uploading]);

  if (!editor) return null;

  const insertBlock = (node: { type: string; attrs: Record<string, unknown> }) =>
    editor.chain().focus().insertContent([node, { type: "paragraph" }]).run();

  async function onPickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so picking the same file again re-triggers
    if (!file) return;

    setVideoError(null);
    const controller = new AbortController();
    uploadAbort.current = controller;
    setUpload({ name: file.name, sent: 0, total: file.size });
    onVideoUploadingChange?.(true);
    try {
      const url = await uploadVideo(file, (sent, total) => setUpload({ name: file.name, sent, total }), controller.signal);
      insertBlock({ type: "video", attrs: { src: url } });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setVideoError(err instanceof Error ? err.message : "वीडियो अपलोड नहीं हो सका।");
      }
    } finally {
      uploadAbort.current = null;
      setUpload(null);
      onVideoUploadingChange?.(false);
    }
  }

  async function addFacebookVideo() {
    if (fbChecking || !fbValue.trim()) return;
    setFbError(null);
    // Direct video links resolve instantly; share links ("Share → Copy link") go via the server,
    // which follows them to the real video (Facebook's player can't play share links).
    let result = parseFacebookVideo(fbValue) as Awaited<ReturnType<typeof resolveFacebookVideoAction>> | null;
    if (!result) {
      setFbChecking(true);
      try {
        result = await resolveFacebookVideoAction(fbValue);
      } catch {
        result = { error: "Facebook लिंक की जाँच नहीं हो सकी — कृपया दोबारा कोशिश करें।" };
      } finally {
        setFbChecking(false);
      }
    }
    if ("error" in result) {
      setFbError(result.error);
      return;
    }
    insertBlock({ type: "facebookVideo", attrs: { src: result.src, portrait: result.portrait } });
    setFbValue("");
    setFbOpen(false);
  }

  return (
    <div className="rounded-md border border-neutral-300">
      <div className="flex flex-wrap gap-1 border-b border-neutral-200 bg-neutral-50 p-2">
        <ToolbarButton title="बोल्ड" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
        <ToolbarButton title="इटैलिक" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolbarButton>
        <ToolbarButton title="अंडरलाइन" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></ToolbarButton>
        <ToolbarButton title="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton title="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <ToolbarButton title="बुलेट लिस्ट" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• सूची</ToolbarButton>
        <ToolbarButton title="क्रमांकित सूची" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. सूची</ToolbarButton>
        <ToolbarButton title="उद्धरण" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;उद्धरण&rdquo;</ToolbarButton>
        <ToolbarButton
          title="लिंक"
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("लिंक URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          🔗
        </ToolbarButton>
        <ToolbarButton
          title="छवि"
          onClick={() => {
            const url = window.prompt("छवि URL (मीडिया लाइब्रेरी से कॉपी करें):");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          🖼️
        </ToolbarButton>
        <ToolbarButton title="क्षैतिज रेखा" onClick={() => editor.chain().focus().setHorizontalRule().run()}>―</ToolbarButton>
        <ToolbarButton
          title={`अपने डिवाइस से वीडियो अपलोड करें (MP4 / WebM / MOV, ${VIDEO_MAX_BYTES / 1024 / 1024}MB तक)`}
          onClick={() => !uploading && videoInputRef.current?.click()}
        >
          🎬 वीडियो अपलोड
        </ToolbarButton>
        <ToolbarButton
          title="Facebook वीडियो का लिंक जोड़ें"
          active={fbOpen}
          onClick={() => {
            setFbOpen((o) => !o);
            setFbError(null);
          }}
        >
          📘 Facebook वीडियो
        </ToolbarButton>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.m4v,.mov,.webm"
          onChange={onPickVideo}
          className="hidden"
        />
      </div>

      {fbOpen && (
        <div className="space-y-1.5 border-b border-sky-100 bg-sky-50 p-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={fbValue}
              onChange={(e) => setFbValue(e.target.value)}
              // Enter must add the video, not submit the whole article form.
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFacebookVideo();
                }
              }}
              placeholder="Facebook वीडियो / रील का लिंक पेस्ट करें"
              autoFocus
              className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addFacebookVideo}
                disabled={fbChecking}
                className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
              >
                {fbChecking ? "जाँच हो रही है…" : "जोड़ें"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFbOpen(false);
                  setFbError(null);
                }}
                className="rounded-md bg-white px-3 py-2 text-sm text-neutral-700 ring-1 ring-neutral-300 hover:bg-neutral-100"
              >
                रद्द
              </button>
            </div>
          </div>
          {fbError && (
            <p role="alert" className="text-xs font-semibold text-red-700">
              {fbError}
            </p>
          )}
          <p className="text-xs text-sky-800">सिर्फ़ Public (सार्वजनिक) Facebook वीडियो चलेंगे। Facebook का Embed कोड भी पेस्ट कर सकते हैं।</p>
        </div>
      )}

      {upload && (
        <div className="space-y-1 border-b border-amber-100 bg-amber-50 p-2 text-xs text-amber-900">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate font-semibold">
              🎬 {upload.name} अपलोड हो रहा है… {Math.round((upload.sent / upload.total) * 100)}%
            </span>
            <button
              type="button"
              onClick={() => uploadAbort.current?.abort()}
              className="shrink-0 rounded bg-white px-2 py-0.5 text-red-700 ring-1 ring-amber-200 hover:bg-red-50"
            >
              रद्द
            </button>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-amber-600 transition-[width]"
              style={{ width: `${(upload.sent / upload.total) * 100}%` }}
            />
          </div>
          <p>
            {mb(upload.sent)} / {mb(upload.total)} MB — पूरा होने तक यह पेज बंद न करें और खबर सेव न करें।
          </p>
        </div>
      )}
      {videoError && (
        <p role="alert" className="border-b border-red-100 bg-red-50 p-2 text-xs font-semibold text-red-800">
          ❌ {videoError}
        </p>
      )}
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}
