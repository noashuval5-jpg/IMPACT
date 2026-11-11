"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/i18n/dict";
import { signOut } from "../login/actions";

export function AdminNav({ t }: { t: Dict }) {
  const pathname = usePathname();
  const items = [
    { href: "/admin", label: t.dashboard },
    { href: "/admin/coaches", label: t.coaches },
    { href: "/admin/lessons", label: t.lessons },
    { href: "/admin/report", label: t.report },
  ];
  return (
    <nav className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-2 pb-2">
      {items.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-medium ${
              active ? "bg-brand-soft text-brand" : "text-muted hover:bg-page hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <form action={signOut} className="ms-auto shrink-0">
        <button
          type="submit"
          className="flex min-h-11 items-center rounded-lg px-3 text-sm text-muted hover:bg-page"
        >
          {t.logout}
        </button>
      </form>
    </nav>
  );
}
