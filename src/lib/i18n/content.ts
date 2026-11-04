import type { Lang } from "./dict";

/** Picks the field in `lang`; when it is empty, falls back to the other language. */
export function pickLang(
  lang: Lang,
  he: string | null | undefined,
  ar: string | null | undefined,
): string {
  const primary = (lang === "he" ? he : ar)?.trim() ?? "";
  if (primary) return primary;
  return (lang === "he" ? ar : he)?.trim() ?? "";
}
