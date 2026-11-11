import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { Card } from "@/components/ui";
import { getI18n } from "@/lib/i18n/server";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { lang, t } = await getI18n("he");
  return (
    <>
      <TopBar lang={lang} t={t} />
      <main className="mx-auto grid max-w-sm gap-4 px-4 py-10">
        <Hero title={t.appName} subtitle={t.tagline} />
        <Card title={t.loginTitle} accent="grape">
          <LoginForm t={t} />
        </Card>
      </main>
    </>
  );
}
