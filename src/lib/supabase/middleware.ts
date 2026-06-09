import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/admin", "/onboarding"];
const onboardingAllowedRoutes = ["/onboarding", "/auth/callback", "/logout"];
const adminRoles = new Set(["admin", "super_admin"]);

function startsWithRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function redirectWithSessionCookies(request: NextRequest, response: NextResponse, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = path === "/login" ? `?next=${encodeURIComponent(request.nextUrl.pathname)}` : "";

  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const pathname = request.nextUrl.pathname;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return startsWithRoute(pathname, protectedRoutes) ? redirectWithSessionCookies(request, response, "/login") : response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed && !startsWithRoute(pathname, onboardingAllowedRoutes)) {
    return redirectWithSessionCookies(request, response, "/onboarding");
  }

  if (profile?.onboarding_completed && pathname === "/onboarding") {
    return redirectWithSessionCookies(request, response, "/dashboard");
  }

  if (startsWithRoute(pathname, ["/admin"])) {
    const { data: roles } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .is("revoked_at", null);

    const canAccessAdmin = (roles ?? []).some((item) => adminRoles.has(String(item.role)));
    if (!canAccessAdmin) {
      return redirectWithSessionCookies(request, response, "/dashboard");
    }
  }

  return response;
}
