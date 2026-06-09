import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function profileNameFromMetadata(metadata: Record<string, unknown>, email: string | null | undefined) {
  const fullName = metadata.full_name ?? metadata.name;
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
  if (email?.includes("@")) return email.split("@")[0];
  return "New student";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=callback", request.url));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=session", request.url));
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    const metadata = user.user_metadata as Record<string, unknown>;
    await supabase.from("profiles").insert({
      id: user.id,
      full_name: profileNameFromMetadata(metadata, user.email),
      email: user.email ?? null,
      onboarding_completed: false,
      is_locked: false
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  const destination = profile?.onboarding_completed ? next : "/onboarding";
  return NextResponse.redirect(new URL(destination, request.url));
}
