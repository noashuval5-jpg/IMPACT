import type { Dict } from "@/lib/i18n/dict";
import { waShareLink } from "@/lib/phone";
import { CopyButton } from "./CopyButton";
import { ChatIcon, CopyIcon, DownloadIcon, ShieldIcon, WhatsAppIcon } from "./icons";
import { btn, Card } from "./ui";

export type LessonViewData = {
  title: string;
  briefing: string;
  message: string;
  flyerUrl: string;
};

/** Short lines like "2. עשה ואל תעשה" or "עשה:" become bold headings; the rest stays plain text. */
function isHeading(line: string): boolean {
  const t = line.trim();
  if (t.length === 0 || t.length > 45 || t.includes("«")) return false;
  return /^\d\.\s/.test(t) || t.endsWith(":") || t.endsWith("):");
}

function BriefingText({ text }: { text: string }) {
  return (
    <div className="grid gap-1 text-base leading-relaxed">
      {text.split("\n").map((line, i) =>
        line.trim() === "" ? (
          <div key={i} className="h-2" aria-hidden="true" />
        ) : isHeading(line) ? (
          <p key={i} className="mt-1 border-s-4 border-sun ps-2 font-bold text-brand">
            {line}
          </p>
        ) : line.startsWith("•") ? (
          <p key={i} className="flex gap-2 ps-1">
            <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-sky" />
            <span>{line.replace(/^•\s*/, "")}</span>
          </p>
        ) : (
          <p key={i}>{line}</p>
        ),
      )}
    </div>
  );
}

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
      <Card title={t.safetyBriefing} icon={<ShieldIcon />} accent="sky">
        <p className="text-muted">{t.lessonComingSoon}</p>
      </Card>
    );
  }

  return (
    <>
      <Card title={t.safetyBriefing} icon={<ShieldIcon />} accent="sky">
        {lesson.title ? (
          <h3 className="mb-3 rounded-2xl bg-brand-soft px-4 py-3 text-xl font-bold text-ink">
            {lesson.title}
          </h3>
        ) : null}
        <BriefingText text={lesson.briefing} />
      </Card>

      {lesson.message || lesson.flyerUrl ? (
        <Card title={t.whatsappMessage} icon={<ChatIcon />} accent="lime">
          {lesson.message ? (
            <p className="relative whitespace-pre-line rounded-2xl rounded-ss-sm bg-ok-soft p-4 leading-relaxed">
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
                  className="mx-auto max-h-[28rem] w-auto rounded-2xl border border-line shadow-md"
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
                  icon={<CopyIcon />}
                />
                <a
                  href={waShareLink(lesson.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btn.whatsapp}
                >
                  <WhatsAppIcon />
                  {t.shareWhatsapp}
                </a>
              </>
            ) : null}
            {lesson.flyerUrl ? (
              <a href={downloadUrl(lesson.flyerUrl)} className={btn.secondary} download>
                <DownloadIcon />
                {t.downloadFlyer}
              </a>
            ) : null}
          </div>
        </Card>
      ) : null}
    </>
  );
}
