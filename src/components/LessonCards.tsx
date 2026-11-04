import type { Dict } from "@/lib/i18n/dict";
import { waShareLink } from "@/lib/phone";
import { CopyButton } from "./CopyButton";
import { btn, Card } from "./ui";

export type LessonViewData = {
  title: string;
  briefing: string;
  message: string;
  flyerUrl: string;
};

function isPdf(url: string): boolean {
  return /\.pdf($|\?)/i.test(url);
}

function downloadUrl(url: string): string {
  return url.includes("?") ? `${url}&download=` : `${url}?download=`;
}

/** The two lesson cards the coach sees: briefing + WhatsApp message. Also used as admin preview. */
export function LessonCards({ t, lesson }: { t: Dict; lesson: LessonViewData | null }) {
  if (!lesson) {
    return (
      <Card title={t.safetyBriefing}>
        <p className="text-muted">{t.lessonComingSoon}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t.safetyBriefing}>
        {lesson.title ? <h3 className="mb-2 text-xl font-bold">{lesson.title}</h3> : null}
        <p className="whitespace-pre-line text-base leading-relaxed">{lesson.briefing}</p>
      </Card>

      {lesson.message || lesson.flyerUrl ? (
        <Card title={t.whatsappMessage}>
          {lesson.message ? (
            <p className="whitespace-pre-line rounded-xl bg-page p-4 leading-relaxed">
              {lesson.message}
            </p>
          ) : null}

          {lesson.flyerUrl ? (
            <div className="mt-4">
              {isPdf(lesson.flyerUrl) ? (
                <a
                  href={lesson.flyerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 items-center justify-center rounded-xl border border-line bg-page px-4 font-medium text-brand"
                >
                  📄 {t.openFlyer} (PDF)
                </a>
              ) : (
                // Flyers live in Supabase Storage; a plain <img> avoids image-domain config.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lesson.flyerUrl}
                  alt={t.flyerAlt}
                  className="mx-auto max-h-[28rem] w-auto rounded-xl border border-line"
                />
              )}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3">
            {lesson.message ? (
              <>
                <CopyButton
                  text={lesson.message}
                  label={t.copyText}
                  copiedLabel={t.copied}
                  className={btn.secondary}
                />
                <a
                  href={waShareLink(lesson.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btn.whatsapp}
                >
                  {t.shareWhatsapp}
                </a>
              </>
            ) : null}
            {lesson.flyerUrl ? (
              <a href={downloadUrl(lesson.flyerUrl)} className={btn.secondary} download>
                {t.downloadFlyer}
              </a>
            ) : null}
          </div>
        </Card>
      ) : null}
    </>
  );
}
