"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-lg" lang="he">
        משהו השתבש. נסו שוב.
      </p>
      <p className="mt-2 text-lg" lang="ar">
        حدث خطأ. حاولوا مرة أخرى.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex min-h-12 items-center rounded-2xl bg-sky px-6 font-bold text-ink"
      >
        ↻
      </button>
    </main>
  );
}
