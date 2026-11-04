import { NextResponse, type NextRequest } from "next/server";
import { isLang, LANG_COOKIE, type Lang } from "@/lib/i18n/dict";

const COACH_PATH = /^\/c\/([A-Za-z0-9_-]{32,128})\/?$/;
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Looks up a coach's language by token (server-side, service role). */
async function coachLanguage(token: string): Promise<Lang | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/coaches?select=language&active=eq.true&token=eq.${encodeURIComponent(token)}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { language?: unknown }[];
    const lang = rows[0]?.language;
    return isLang(lang) ? lang : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Coach page: on first visit (no language cookie yet) use the coach's language.
  const match = COACH_PATH.exec(pathname);
  if (match && !isLang(request.cookies.get(LANG_COOKIE)?.value)) {
    const lang = await coachLanguage(match[1]!);
    if (lang) {
      request.cookies.set(LANG_COOKIE, lang);
      const response = NextResponse.next({ request });
      response.cookies.set(LANG_COOKIE, lang, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/c/:path*"],
};
