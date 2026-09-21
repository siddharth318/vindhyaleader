"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

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
}: {
  name: string;
  initialContent?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: "यहाँ खबर लिखें..." }),
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: "prose prose-neutral max-w-none min-h-[300px] px-3 py-2 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
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
      <input type="hidden" name={name} value={editor.getHTML()} readOnly />
    </div>
  );
}
