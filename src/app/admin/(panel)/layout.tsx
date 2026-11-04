import { TopBar } from "@/components/TopBar";
import { requireAdmin } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const { lang, t } = await getI18n("he");
  return (
    <>
      <TopBar lang={lang} t={t}>
        <AdminNav t={t} />
      </TopBar>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
