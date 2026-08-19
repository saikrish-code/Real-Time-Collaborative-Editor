"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import Toolbar from "./Toolbar";

const COLORS = [
  "#f78da7", "#cf2e2e", "#ff6900", "#fcb900", "#7bdcb5",
  "#00d084", "#8ed1fc", "#0693e3", "#abb8c3", "#9b51e0"
];

function InnerEditor({ ydoc, provider }: { ydoc: Y.Doc; provider: WebsocketProvider }) {
  const name = provider.awareness.getLocalState()?.user?.name || "User";
  const color = provider.awareness.getLocalState()?.user?.color || "#000";

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        Underline,
        Collaboration.configure({
          document: ydoc,
          field: "default",
        }),
        CollaborationCaret.configure({
          provider,
          user: {
            name,
            color,
          },
        }),
      ],
      editorProps: {
        attributes: {
          class: "tiptap-editor focus:outline-none",
        },
      },
    },
    [ydoc, provider]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="px-6 py-5" />
    </div>
  );
}

export default function Editor() {
  const [clientReady, setClientReady] = useState(false);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    
    // Get room from URL query or fallback
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("room") || "default-room";
    
    const wsProvider = new WebsocketProvider(
      "ws://localhost:1234",
      roomId,
      doc
    );

    // Random user presence details
    const randomName = `User ${Math.floor(Math.random() * 1000)}`;
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    wsProvider.awareness.setLocalStateField("user", {
      name: randomName,
      color: randomColor,
    });

    setYdoc(doc);
    setProvider(wsProvider);
    setClientReady(true);

    return () => {
      wsProvider.destroy();
      doc.destroy();
    };
  }, []);

  if (!clientReady || !ydoc || !provider) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Connecting to editor...</span>
      </div>
    );
  }

  return <InnerEditor ydoc={ydoc} provider={provider} />;
}
