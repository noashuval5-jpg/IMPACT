import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TopBar } from "@/components/TopBar";
import { getI18n } from "@/lib/i18n/server";

export default async function Home() {
  const { lang, t } = await getI18n();
  return (
    <>
      <TopBar lang={lang} t={t} />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
        <Logo className="h-20 w-20" />
        <h1 className="mt-6 text-3xl font-bold text-brand">{t.appName}</h1>
        <p className="mt-3 text-lg text-muted">{t.tagline}</p>
        <Link
          href="/admin"
          className="mt-10 inline-flex min-h-12 items-center rounded-xl border border-line bg-white px-6 font-medium text-brand hover:bg-brand-soft"
        >
          {t.loginTitle}
        </Link>
      </main>
    </>
  );
}
