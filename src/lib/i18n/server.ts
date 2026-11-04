import "server-only";
import { cookies } from "next/headers";
import { getDict, isLang, LANG_COOKIE, type Dict, type Lang } from "./dict";

/** Language from the cookie, or `fallback` when no valid cookie is set. */
export async function getLang(fallback: Lang = "he"): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : fallback;
}

export async function getI18n(fallback: Lang = "he"): Promise<{ lang: Lang; t: Dict }> {
  const lang = await getLang(fallback);
  return { lang, t: getDict(lang) };
}
