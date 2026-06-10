import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, canManageRoles, canModerateSupport, isUserRole, type UserRole } from "@/lib/permissions";

export interface ProfileRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  onboarding_completed: boolean;
  is_locked: boolean;
}

export interface AuthContext {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  profile: ProfileRecord | null;
  role: UserRole;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<ProfileRecord | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone_number, onboarding_completed, is_locked")
    .eq("id", user.id)
    .maybeSingle();

  return data as ProfileRecord | null;
}

export async function getCurrentRole(): Promise<UserRole> {
  const user = await getCurrentUser();
  if (!user) return "student";

  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .is("revoked_at", null);

  const ranked = (data ?? [])
    .map((item) => item.role)
    .filter(isUserRole)
    .sort((a, b) => roleWeight(b) - roleWeight(a));

  return ranked[0] ?? "student";
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOnboardedUser(): Promise<AuthContext> {
  const user = await requireUser();
  const [profile, role] = await Promise.all([getCurrentProfile(), getCurrentRole()]);

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return { user, profile, role };
}

export async function requireAdmin() {
  const auth = await requireOnboardedUser();
  if (!canAccessAdmin(auth.role)) redirect("/dashboard");
  return auth;
}

export async function requirePlatformAdmin() {
  const auth = await requireOnboardedUser();
  if (auth.role !== "admin" && auth.role !== "super_admin") redirect("/admin");
  return auth;
}

export async function requireSupportModerator() {
  const auth = await requireOnboardedUser();
  if (!canModerateSupport(auth.role)) redirect("/dashboard");
  return auth;
}

export async function requireSuperAdmin() {
  const auth = await requireOnboardedUser();
  if (!canManageRoles(auth.role)) redirect("/admin");
  return auth;
}

export function getRoleFromMetadata(metadata: Record<string, unknown> | undefined): UserRole | undefined {
  const role = metadata?.role;
  return isUserRole(role) ? role : undefined;
}

function roleWeight(role: UserRole) {
  switch (role) {
    case "super_admin":
      return 50;
    case "admin":
      return 40;
    case "content_manager":
      return 30;
    case "support_moderator":
      return 20;
    case "student":
      return 10;
  }
}
