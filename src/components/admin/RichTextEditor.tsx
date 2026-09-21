"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import { uploadEditorImageAction } from "@/lib/actions/media-actions";

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
}: {
  name: string;
  initialContent?: string;
  /** Called with the Media id whenever a pasted/embedded image gets auto-uploaded. */
  onImageUploaded?: (mediaId: string, url: string) => void;
}) {
  const [html, setHtml] = useState(initialContent || "");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
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

  if (!editor) return null;

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
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}
