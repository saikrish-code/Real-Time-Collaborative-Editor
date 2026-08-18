"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Toolbar from "./Toolbar";

export default function Editor() {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "<p>Start writing here…</p>",
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none",
      },
    },
  });

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="px-6 py-5" />
    </div>
  );
}
