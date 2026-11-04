import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getLesson } from "@/lib/data/common";
import { getDict } from "@/lib/i18n/dict";
import { getI18n } from "@/lib/i18n/server";
import { fillTemplate } from "@/lib/phone";
import { parseWeek } from "@/lib/validate";
import { LessonEditor } from "./LessonEditor";

export default async function LessonEditPage({ params }: { params: Promise<{ week: string }> }) {
  await requireAdmin();
  const week = parseWeek((await params).week);
  if (!week) notFound();
  const { t } = await getI18n("he");
  const lesson = await getLesson(week);

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/lessons" className="text-sm text-brand underline">
          {t.back}
        </Link>
        <h1 className="text-2xl font-bold">{fillTemplate(t.week, { n: week })}</h1>
      </div>
      <LessonEditor
        t={t}
        previewDicts={{ he: getDict("he"), ar: getDict("ar") }}
        week={week}
        initial={
          lesson ?? {
            week_number: week,
            title_he: "",
            title_ar: "",
            briefing_he: "",
            briefing_ar: "",
            message_he: "",
            message_ar: "",
            flyer_he_url: null,
            flyer_ar_url: null,
          }
        }
      />
    </div>
  );
}
