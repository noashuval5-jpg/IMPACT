import type { Dict, Lang } from "@/lib/i18n/dict";
import { LangToggle } from "./LangToggle";
import { ColorStripe, Logo } from "./Logo";

export function TopBar({
  lang,
  t,
  children,
}: {
  lang: Lang;
  t: Dict;
  children?: React.ReactNode;
}) {
  return (
    <header className="no-print sticky top-0 z-10 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Logo />
          <span className="truncate text-lg font-bold text-brand">{t.appName}</span>
        </div>
        <LangToggle current={lang} />
      </div>
      {children}
      <ColorStripe />
    </header>
  );
}
