import Link from "next/link";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { listLessons } from "@/lib/data/admin";
import { getStatus } from "@/lib/data/common";
import type { Dict } from "@/lib/i18n/dict";
import { getI18n } from "@/lib/i18n/server";
import { fillTemplate } from "@/lib/phone";
import type { Lesson } from "@/lib/types";
import { ALL_WEEKS, currentWeek } from "@/lib/week";

function isFilled(lesson: Lesson | undefined, lang: "he" | "ar"): boolean {
  if (!lesson) return false;
  return [lesson[`title_${lang}`], lesson[`briefing_${lang}`], lesson[`message_${lang}`]].every(
    (v) => v.trim().length > 0,
  );
}

function Pill({ ok, label, t }: { ok: boolean; label: string; t: Dict }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        ok ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"
      }`}
    >
      {label}: {ok ? t.filled : t.empty}
    </span>
  );
}

export default async function LessonsPage() {
  await requireAdmin();
  const { t } = await getI18n("he");
  const [lessons, { status }] = await Promise.all([listLessons(), getStatus()]);
  const byWeek = new Map(lessons.map((l) => [l.week_number, l]));
  const now = currentWeek(status);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">{t.lessons}</h1>
      <Card>
        <ul className="divide-y divide-line">
          {ALL_WEEKS.map((w) => {
            const lesson = byWeek.get(w);
            const title = lesson?.title_he || lesson?.title_ar || "";
            return (
              <li key={w}>
                <Link
                  href={`/admin/lessons/${w}`}
                  className="flex min-h-14 flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-3 hover:bg-page"
                >
                  <span className="min-w-0">
                    <span className="font-semibold">{fillTemplate(t.week, { n: w })}</span>
                    {w === now ? (
                      <span className="ms-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">
                        {t.thisWeek}
                      </span>
                    ) : null}
                    {title ? <span className="ms-2 text-muted">{title}</span> : null}
                  </span>
                  <span className="flex gap-2">
                    <Pill ok={isFilled(lesson, "he")} label={t.hebrew} t={t} />
                    <Pill ok={isFilled(lesson, "ar")} label={t.arabic} t={t} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
