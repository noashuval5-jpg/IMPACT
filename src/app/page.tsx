import Link from "next/link";
import { ChatIcon, CheckCircleIcon, ShieldIcon } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { TopBar } from "@/components/TopBar";
import { btn } from "@/components/ui";
import { getI18n } from "@/lib/i18n/server";

export default async function Home() {
  const { lang, t } = await getI18n();
  const steps = [
    { icon: <ShieldIcon className="h-7 w-7" />, label: t.safetyBriefing, cls: "bg-sky text-ink" },
    { icon: <ChatIcon className="h-7 w-7" />, label: t.whatsappMessage, cls: "bg-lime text-ink" },
    { icon: <CheckCircleIcon className="h-7 w-7" />, label: t.done, cls: "bg-grape text-white" },
  ];
  return (
    <>
      <TopBar lang={lang} t={t} />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-10 text-center">
        <div className="relative mb-8 h-44 w-44" aria-hidden="true">
          <span className="absolute inset-0 rounded-full bg-sky" />
          <span className="absolute -top-2 -end-4 h-16 w-16 rounded-full bg-sun" />
          <span className="absolute -bottom-1 -start-5 h-14 w-14 rounded-full bg-lime" />
          <span className="absolute top-6 -start-6 h-8 w-8 rounded-full bg-flame" />
          <span className="absolute bottom-3 -end-3 h-6 w-6 rounded-full bg-grape" />
          <span className="float absolute inset-8 flex items-center justify-center rounded-full bg-white shadow-lg">
            <Logo className="h-20 w-20" />
          </span>
        </div>
        <h1 className="rise text-4xl font-extrabold text-ink">{t.appName}</h1>
        <p className="rise mt-3 text-lg font-medium text-muted">{t.tagline}</p>

        <ol className="mt-10 grid w-full grid-cols-3 gap-3">
          {steps.map((s, i) => (
            <li
              key={s.label}
              className="rise flex flex-col items-center gap-2 rounded-3xl border border-line bg-white p-3 shadow-sm"
              style={{ animationDelay: `${120 + i * 120}ms` }}
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.cls}`}>
                {s.icon}
              </span>
              <span className="text-sm font-semibold text-ink">{s.label}</span>
            </li>
          ))}
        </ol>

        <Link href="/admin" className={btn.primary + " mt-10 px-8"}>
          {t.loginTitle}
        </Link>
      </main>
    </>
  );
}
