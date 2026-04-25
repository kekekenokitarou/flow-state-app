"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function HomeError({ error, reset }: ErrorPageProps) {
  console.error("[HomeError]", error);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
      <p className="text-sm text-zinc-500">Something went wrong.</p>
      <button
        onClick={reset}
        className="rounded-lg border border-zinc-200 px-4 py-2 text-xs text-zinc-600 transition-colors hover:bg-zinc-50"
      >
        Try again
      </button>
    </div>
  );
}
