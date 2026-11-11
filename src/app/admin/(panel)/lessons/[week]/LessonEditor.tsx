"use client";

import { useState } from "react";
import { LessonCards } from "@/components/LessonCards";
import { btn, Card, Field, input, Notice } from "@/components/ui";
import { useFormSubmit } from "@/components/useFormSubmit";
import type { Dict, Lang } from "@/lib/i18n/dict";
import { lessonView } from "@/lib/lessonView";
import type { Lesson } from "@/lib/types";
import { FLYER_MAX_BYTES, FLYER_TYPES } from "@/lib/validate";
import { createFlyerUpload, saveLesson, type SaveState } from "./actions";

type TextField = "title" | "briefing" | "message";

function FlyerInput({
  t,
  week,
  lang,
  url,
  onChange,
}: {
  t: Dict;
  week: number;
  lang: Lang;
  url: string | null;
  onChange: (url: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (!FLYER_TYPES[file.type]) return setError(t.fileWrongType);
    if (file.size > FLYER_MAX_BYTES) return setError(t.fileTooBig);
    setBusy(true);
    try {
      const ticket = await createFlyerUpload(week, lang, file.type, file.size);
      if (!ticket.ok) {
        setError(
          ticket.reason === "type"
            ? t.fileWrongType
            : ticket.reason === "size"
              ? t.fileTooBig
              : t.errorTryAgain,
        );
        return;
      }
      const res = await fetch(ticket.signedUrl, {
        method: "PUT",
        headers: { "content-type": file.type, "x-upsert": "false" },
        body: file,
      });
      if (!res.ok) {
        setError(t.errorTryAgain);
        return;
      }
      onChange(ticket.publicUrl);
    } catch {
      setError(t.errorTryAgain);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{t.uploadFlyer}</span>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-brand underline" dir="ltr">
          {url.split("/").pop()}
        </a>

      ) : null}
      <label
        className={`relative flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-brand/40 bg-page px-4 text-sm font-medium text-brand hover:bg-brand-soft ${busy ? "opacity-60" : ""}`}
      >
        ⬆ {t.flyer}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          disabled={busy}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
      </label>
      {busy ? <p className="text-sm text-muted">{t.uploading}</p> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}

export function LessonEditor({
  t,
  previewDicts,
  week,
  initial,
}: {
  t: Dict;
  previewDicts: Record<Lang, Dict>;
  week: number;
  initial: Lesson;
}) {
  const [lesson, setLesson] = useState<Lesson>(initial);
  const [previewLang, setPreviewLang] = useState<Lang>("he");
  const { state, pending, onSubmit } = useFormSubmit<SaveState>(
    (formData) => saveLesson({ status: "idle" }, formData),
    { status: "idle" },
  );

  const set = (key: keyof Lesson, value: string | null) =>
    setLesson((l) => ({ ...l, [key]: value }));

  const column = (lang: Lang) => {
    const label = lang === "he" ? t.inHebrew : t.inArabic;
    const field = (f: TextField) => `${f}_${lang}` as const;
    return (
      <Card title={label} className="grid gap-4">
        <div lang={lang} className="grid gap-4">
          <Field label={t.title}>
            <input
              name={field("title")}
              maxLength={200}
              value={lesson[field("title")]}
              onChange={(e) => set(field("title"), e.target.value)}
              className={input}
            />
          </Field>
          <Field label={t.briefing}>
            <textarea
              name={field("briefing")}
              rows={8}
              maxLength={5000}
              value={lesson[field("briefing")]}
              onChange={(e) => set(field("briefing"), e.target.value)}
              className={input + " py-2"}
            />
          </Field>
          <Field label={t.parentsMessage}>
            <textarea
              name={field("message")}
              rows={5}
              maxLength={5000}
              value={lesson[field("message")]}
              onChange={(e) => set(field("message"), e.target.value)}
              className={input + " py-2"}
            />
          </Field>
        </div>
        <input type="hidden" name={`flyer_${lang}_url`} value={lesson[`flyer_${lang}_url`] ?? ""} />
        <FlyerInput
          t={t}
          week={week}
          lang={lang}
          url={lesson[`flyer_${lang}_url`]}
          onChange={(url) => set(`flyer_${lang}_url`, url)}
        />
      </Card>
    );
  };

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[1fr_380px]">
      <form onSubmit={onSubmit} className="grid min-w-0 gap-4">
        <input type="hidden" name="week_number" value={week} />
        <div className="grid gap-4 lg:grid-cols-2">
          {column("he")}
          {column("ar")}
        </div>
        {state.status === "saved" ? <Notice tone="ok">✓ {t.saved}</Notice> : null}
        {state.status === "error" ? <Notice tone="error">{t.errorTryAgain}</Notice> : null}
        <div>
          <button type="submit" className={btn.primary + " min-w-40"} disabled={pending}>
            {t.save}
          </button>
        </div>
      </form>

      <aside className="grid content-start gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">{t.preview}</h2>
            <p className="text-sm text-muted">{t.previewNote}</p>
          </div>
          <div className="flex rounded-full border border-line bg-white p-1 text-sm">
            {(["he", "ar"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setPreviewLang(l)}
                aria-pressed={previewLang === l}
                className={`min-h-10 rounded-full px-3 ${previewLang === l ? "bg-sky font-bold text-ink" : ""}`}
              >
                {l === "he" ? "עברית" : "العربية"}
              </button>
            ))}
          </div>
        </div>
        <div
          lang={previewLang}
          className="grid max-w-[380px] gap-4 rounded-3xl border-8 border-ink/80 bg-page p-3"
        >
          <LessonCards t={previewDicts[previewLang]} lesson={lessonView(lesson, previewLang)} />
        </div>
      </aside>
    </div>
  );
}
