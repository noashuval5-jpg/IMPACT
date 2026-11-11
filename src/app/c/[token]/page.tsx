import type { Metadata } from "next";
import { LessonCards } from "@/components/LessonCards";
import { Hero } from "@/components/Hero";
import { TopBar } from "@/components/TopBar";
import Link from "next/link";
import { btn, Card } from "@/components/ui";
import { findCoachByToken, getCoachWeekDone } from "@/lib/data/coach";
import { getLesson, getStatus } from "@/lib/data/common";
import { getI18n } from "@/lib/i18n/server";
import { lessonView } from "@/lib/lessonView";
import { fillTemplate } from "@/lib/phone";
import { parseWeek } from "@/lib/validate";
import { DoneCard } from "./DoneCard";
import { WeekPicker } from "./WeekPicker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function CoachPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ week?: string | string[] }>;
}) {
  const { token } = await params;
  const { week: weekParam } = await searchParams;
  const coach = await findCoachByToken(token);
  // Middleware sets the cookie to the coach's language on first visit.
  const { lang, t } = await getI18n(coach?.language ?? "he");

  if (!coach) {
    return (
      <>
        <TopBar lang={lang} t={t} />
        <main className="mx-auto max-w-xl px-4 py-10">
          <Card>
            <p className="text-center text-lg">{t.invalidLink}</p>
          </Card>
        </main>
      </>
    );
  }

  const { status } = await getStatus();
  const current = status.kind === "active" ? status.week : null;
  // Coaches can read every week's content; marking "done" is only for the current week.
  const selected =
    parseWeek(Array.isArray(weekParam) ? weekParam[0] : weekParam) ??
    current ??
    (status.kind === "finished" ? 10 : 1);
  const isCurrent = selected === current;

  const [lesson, doneAt] = await Promise.all([
    getLesson(selected),
    current !== null ? getCoachWeekDone(coach.id, current) : Promise.resolve(null),
  ]);

  const body = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold">{fillTemplate(t.week, { n: selected })}</h2>
          {isCurrent ? (
            <span className="rounded-full bg-grape px-3 py-0.5 text-sm font-semibold text-white">
              {t.currentWeekBadge}
            </span>
          ) : null}
        </div>
        {isCurrent ? (
          <a href="#done" className={btn.secondary + " min-h-12 px-4 text-sm"}>
            {t.jumpToDone}
          </a>
        ) : null}
      </div>
      <LessonCards t={t} lesson={lessonView(lesson, lang)} />
      {isCurrent ? (
        <div id="done" className="scroll-mt-20">
          <DoneCard token={token} initialDoneAt={doneAt} t={t} />
        </div>
      ) : (
        <Card>
          <p className="text-muted">
            {status.kind === "active" ? t.markOnlyCurrent : status.kind === "finished" ? t.finished : t.notStarted}
          </p>
          {current !== null ? (
            <Link href={`/c/${token}`} className={btn.primary + " mt-3 w-full"}>
              {t.backToThisWeek}
            </Link>
          ) : null}
        </Card>
      )}
    </>
  );

  return (
    <>
      <TopBar lang={lang} t={t} />
      <main className="mx-auto grid max-w-xl gap-4 px-4 py-5">
        <Hero
          title={fillTemplate(t.hello, { name: coach.full_name })}
          subtitle={t.tagline}
          badge={
            status.kind === "active" ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-sm font-bold text-brand">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-grape" />
                {fillTemplate(t.weekOfTotal, { n: status.week })}
              </span>
            ) : null
          }
        />
        <WeekPicker t={t} token={token} selected={selected} current={current} />
        {body}
        <p className="pb-6 pt-2 text-center text-sm font-medium text-muted">
          {t.appName} · {t.tagline}
        </p>
      </main>
    </>
  );
}
