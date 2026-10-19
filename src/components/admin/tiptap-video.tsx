"use client";

import { Node, NodeViewWrapper, ReactNodeViewRenderer, mergeAttributes, type NodeViewProps } from "@tiptap/react";
import { isFacebookPluginUrl, isOurVideoUrl } from "@/lib/video";

/**
 * Two block nodes for the article editor:
 *  - `video`         a video file we host (uploaded from the device) -> <video controls src=…>
 *  - `facebookVideo` a Facebook video/reel -> <iframe src="facebook.com/plugins/video.php?…">
 * Each serialises to plain HTML (what the article stores and the sanitizer re-checks) and parses
 * back from it, so editing an existing article keeps its videos. Inside the editor they appear as
 * small cards with a remove button rather than live players.
 */

function EmbedCard({ title, children, deleteNode, selected }: { title: string; children: React.ReactNode; deleteNode: () => void; selected: boolean }) {
  return (
    <NodeViewWrapper
      className={`my-3 rounded-lg border bg-neutral-50 p-2 ${selected ? "border-red-600 ring-2 ring-red-200" : "border-neutral-200"}`}
      data-drag-handle
    >
      <div contentEditable={false}>
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-neutral-600">
          <span>{title}</span>
          <button type="button" onClick={deleteNode} className="rounded bg-white px-2 py-0.5 text-red-700 ring-1 ring-neutral-200 hover:bg-red-50">
            ✕ हटाएँ
          </button>
        </div>
        {children}
      </div>
    </NodeViewWrapper>
  );
}

function VideoView({ node, deleteNode, selected }: NodeViewProps) {
  return (
    <EmbedCard title="🎬 वीडियो" deleteNode={deleteNode} selected={selected}>
      <video src={String(node.attrs.src)} controls preload="metadata" playsInline className="max-h-72 w-full rounded bg-black" />
    </EmbedCard>
  );
}

function FacebookVideoView({ node, deleteNode, selected }: NodeViewProps) {
  // Show the original Facebook link instead of loading Facebook inside the editor.
  let href = "";
  try {
    href = new URL(String(node.attrs.src)).searchParams.get("href") ?? "";
  } catch {}
  return (
    <EmbedCard title="📘 Facebook वीडियो" deleteNode={deleteNode} selected={selected}>
      <p className="break-all rounded bg-white p-2 text-xs text-neutral-600">{href}</p>
      <p className="mt-1 text-xs text-neutral-400">प्रकाशित खबर में यहाँ Facebook का वीडियो प्लेयर दिखेगा।</p>
    </EmbedCard>
  );
}

export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: "video[src]", getAttrs: (el) => (isOurVideoUrl(el.getAttribute("src") ?? "") ? null : false) }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { controls: "", preload: "metadata", playsinline: "" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VideoView);
  },
});

export const FacebookVideo = Node.create({
  name: "facebookVideo",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      // Reels are tall (9:16); remembered through a CSS class on the iframe.
      portrait: {
        default: false,
        parseHTML: (el) => el.classList.contains("fb-portrait"),
        renderHTML: () => ({}),
      },
    };
  },
  parseHTML() {
    return [{ tag: "iframe[src]", getAttrs: (el) => (isFacebookPluginUrl(el.getAttribute("src") ?? "") ? null : false) }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(HTMLAttributes, {
        class: `video-embed ${node.attrs.portrait ? "fb-portrait" : "fb-landscape"}`,
        allow: "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share",
        allowfullscreen: "true",
        loading: "lazy",
        frameborder: "0",
        scrolling: "no",
        title: "Facebook वीडियो",
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(FacebookVideoView);
  },
});
