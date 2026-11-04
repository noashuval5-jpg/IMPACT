import type { Metadata } from "next";
import { LessonCards } from "@/components/LessonCards";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui";
import { findCoachByToken, getCoachGroups } from "@/lib/data/coach";
import { getLesson, getStatus } from "@/lib/data/common";
import { getI18n } from "@/lib/i18n/server";
import { lessonView } from "@/lib/lessonView";
import { fillTemplate } from "@/lib/phone";
import { GroupsCard } from "./GroupsCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function CoachPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
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
  const firstName = coach.full_name;

  let body: React.ReactNode;
  if (status.kind !== "active") {
    body = (
      <Card>
        <p className="text-center text-lg">
          {status.kind === "finished" ? t.finished : t.notStarted}
        </p>
      </Card>
    );
  } else {
    const [lesson, groups] = await Promise.all([
      getLesson(status.week),
      getCoachGroups(coach.id, status.week),
    ]);
    body = (
      <>
        <LessonCards t={t} lesson={lessonView(lesson, lang)} />
        <GroupsCard token={token} groups={groups} t={t} />
      </>
    );
  }

  return (
    <>
      <TopBar lang={lang} t={t} />
      <main className="mx-auto grid max-w-xl gap-4 px-4 py-5">
        <div>
          <h1 className="text-2xl font-bold">{fillTemplate(t.hello, { name: firstName })}</h1>
          {status.kind === "active" ? (
            <p className="mt-1 text-muted">
              {fillTemplate(t.weekOfTotal, { n: status.week })}
            </p>
          ) : null}
        </div>
        {body}
        <p className="pb-6 pt-2 text-center text-sm text-muted">{t.tagline}</p>
      </main>
    </>
  );
}
