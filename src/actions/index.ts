"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import type { AssignableRole } from "@/lib/role-management";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations";

function getOrigin(headerOrigin: string | null) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? headerOrigin ?? "http://localhost:3000";
}

export async function signInWithGoogleAction() {
  const headerStore = await headers();
  const supabase = await createClient();
  const origin = getOrigin(headerStore.get("origin"));

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`
    }
  });

  if (error) throw new Error(error.message);
  if (data.url) redirect(data.url as Parameters<typeof redirect>[0]);

  throw new Error("Google sign-in did not return a redirect URL.");
}

export async function completeOnboardingAction(formData: FormData) {
  const payload = onboardingSchema.parse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber")
  });

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_profile_onboarding", {
    profile_full_name: payload.fullName,
    profile_email: payload.email,
    profile_phone_number: payload.phoneNumber
  });

  if (error) throw new Error(error.message);
  redirect("/dashboard");
}

export async function completeProfileAction(formData: FormData) {
  return completeOnboardingAction(formData);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function grantUserRoleAction(formData: FormData) {
  await requireSuperAdmin();

  const targetUserId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as AssignableRole;
  const supabase = await createClient();

  const { error } = await supabase.rpc("manage_user_role", {
    target_user_id: targetUserId,
    target_role: role,
    should_revoke: false
  });

  if (error) throw new Error(error.message);
  redirect("/admin");
}

export async function revokeUserRoleAction(formData: FormData) {
  await requireSuperAdmin();

  const targetUserId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as AssignableRole;
  const supabase = await createClient();

  const { error } = await supabase.rpc("manage_user_role", {
    target_user_id: targetUserId,
    target_role: role,
    should_revoke: true
  });

  if (error) throw new Error(error.message);
  redirect("/admin");
}
