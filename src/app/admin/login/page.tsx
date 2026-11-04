import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui";
import { getI18n } from "@/lib/i18n/server";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { lang, t } = await getI18n("he");
  return (
    <>
      <TopBar lang={lang} t={t} />
      <main className="mx-auto max-w-sm px-4 py-12">
        <Card title={t.loginTitle}>
          <LoginForm t={t} />
        </Card>
      </main>
    </>
  );
}
