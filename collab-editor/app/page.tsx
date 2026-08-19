import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-[family-name:var(--font-geist-sans)] dark:bg-zinc-950">
      <main className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Collab Editor
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          A real-time collaborative text editor
        </p>
        <Link
          href="/editor"
          className="mt-8 inline-flex items-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Open Editor
        </Link>
      </main>
    </div>
  );
}
