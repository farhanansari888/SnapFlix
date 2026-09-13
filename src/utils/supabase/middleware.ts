import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "../env";

const PROTECTED_PATHS = env.PROTECTED_PATHS?.split(",") ?? [];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // If Supabase URL is placeholder/invalid, skip auth check gracefully
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  if (
    !supabaseUrl ||
    !supabaseUrl.startsWith("http") ||
    supabaseUrl.includes("your_supabase_url")
  ) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "dummy-key",
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // if user is not logged in and the current pathname is protected, redirect to login page
    if (!user && PROTECTED_PATHS.some((url) => pathname.startsWith(url))) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";

      const redirectRes = NextResponse.redirect(url);

      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectRes.cookies.set(cookie.name, cookie.value, cookie);
      });

      return redirectRes;
    }

    // if user is logged in and the current pathname is auth, redirect to home page
    if (user && pathname === "/auth") {
      const url = request.nextUrl.clone();
      url.pathname = "/";

      const redirectRes = NextResponse.redirect(url);

      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectRes.cookies.set(cookie.name, cookie.value, cookie);
      });

      return redirectRes;
    }
  } catch (error) {
    // If Supabase call fails in dev/mock, pass through
    return supabaseResponse;
  }

  return supabaseResponse;
}
