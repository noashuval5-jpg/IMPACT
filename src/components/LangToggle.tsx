"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LANG_COOKIE, type Lang } from "@/lib/i18n/dict";

const OPTIONS: { lang: Lang; label: string }[] = [
  { lang: "he", label: "עברית" },
  { lang: "ar", label: "العربية" },
];

export function LangToggle({ current }: { current: Lang }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(lang: Lang) {
    if (lang === current) return;
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label="Language / שפה / اللغة"
      className={`flex rounded-full border border-line bg-white p-1 text-sm ${pending ? "opacity-60" : ""}`}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.lang}
          type="button"
          lang={o.lang}
          onClick={() => choose(o.lang)}
          aria-pressed={o.lang === current}
          className={`min-h-10 rounded-full px-3 font-medium transition-colors ${
            o.lang === current ? "bg-sky font-bold text-ink" : "text-ink hover:bg-brand-soft"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
