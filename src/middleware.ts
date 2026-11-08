import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
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
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase
      .from("coaches")
      .select("language")
      .eq("token", token)
      .eq("active", true)
      .maybeSingle();
    const lang: unknown = data?.language;
    return isLang(lang) ? lang : null;
  } catch {
    return null;
  }
}

/** Refreshes the Supabase session and redirects to login when there is none. */
async function guardAdmin(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data } = await supabase.auth.getUser();
  const isLogin = request.nextUrl.pathname === "/admin/login";
  if (!data.user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (data.user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request);
  }

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
  matcher: ["/c/:path*", "/admin", "/admin/:path*"],
};
