"use client";

import { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import Toolbar from "./Toolbar";

export default function Editor() {
  // Y.Doc is the root container for all shared CRDT state in a collaborative session.
  // Think of it as the in-memory "document server" — every client editing the same
  // room holds a Y.Doc that stays in sync via a network provider (not wired up yet).
  // For now this instance lives only in the browser; edits are stored in the CRDT
  // tree instead of Tiptap's default local ProseMirror doc.
  const ydoc = useMemo(() => new Y.Doc(), []);

  // Y.XmlFragment (field: "default") is the shared type that stores the editor's
  // document tree as a CRDT. Collaboration.bind maps ProseMirror ↔ this fragment;
  // every keystroke mutates it. A future WebSocket provider will sync only the
  // binary CRDT deltas between clients — not the full HTML string.
  useEffect(() => {
    return () => {
      ydoc.destroy();
    };
  }, [ydoc]);

  const editor = useEditor(
    {
      extensions: [
        // Collaboration ships its own undo/redo backed by Yjs — disable StarterKit's.
        StarterKit.configure({ undoRedo: false }),
        Underline,
        Collaboration.configure({
          document: ydoc,
          field: "default", // ydoc.getXmlFragment("default")
        }),
      ],
      // Do not pass `content` — the Y.XmlFragment is the single source of truth.
      editorProps: {
        attributes: {
          class: "tiptap-editor focus:outline-none",
        },
      },
    },
    [ydoc],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="px-6 py-5" />
    </div>
  );
}
