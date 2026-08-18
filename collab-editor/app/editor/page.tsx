import Editor from "@/components/Editor";

export const metadata = {
  title: "Editor | Collab Editor",
  description: "Editor powered by Tiptap",
};

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-[family-name:var(--font-geist-sans)] dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Collab Editor
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Type whatever you feel like.
          </p>
        </header>

        <Editor />
      </div>
    </div>
  );
}
