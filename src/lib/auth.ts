import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/permissions";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function getRoleFromMetadata(metadata: Record<string, unknown> | undefined): UserRole | undefined {
  const role = metadata?.role;
  if (role === "super_admin" || role === "admin" || role === "instructor" || role === "student" || role === "support") {
    return role;
  }
  return undefined;
}
