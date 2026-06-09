import "server-only";
import { requireSuperAdmin } from "@/lib/auth";
import type { UserRole } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

export type AssignableRole = Exclude<UserRole, "student">;

export async function grantUserRole(userId: string, role: AssignableRole) {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("manage_user_role", {
    target_user_id: userId,
    target_role: role,
    should_revoke: false
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function revokeUserRole(userId: string, role: AssignableRole) {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("manage_user_role", {
    target_user_id: userId,
    target_role: role,
    should_revoke: true
  });

  if (error) throw new Error(error.message);
  return data;
}
