"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/auth";
import { writeAuditEvent } from "@/lib/audit";
import { hasSupabaseAdminEnv } from "@/lib/lms";
import { createAdminClient } from "@/lib/supabase/admin";

function ensureAdminEnv() {
  if (!hasSupabaseAdminEnv()) throw new Error("Supabase admin environment variables are required.");
  return createAdminClient();
}

function text(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || null;
}

function requiredText(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

function checkbox(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true";
}

async function notifyCertificate(userId: string, certificateId: string | null | undefined, revoked = false) {
  if (!certificateId) return;
  const supabase = ensureAdminEnv();
  await supabase.from("notifications").insert({
    user_id: userId,
    title: revoked ? "Certificate revoked" : "Certificate issued",
    body: revoked ? "A certificate was revoked by admin." : "Your certificate is available in your dashboard.",
    action_url: "/dashboard/certificates",
    related_type: "certificate",
    related_id: certificateId
  });
}

export async function issueCertificateAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
  const supabase = ensureAdminEnv();
  const userId = requiredText(formData, "userId");
  const courseId = requiredText(formData, "courseId");
  const manualOverride = checkbox(formData, "manualOverride");
  const manualReason = text(formData, "manualReason");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://plickify.vercel.app";

  const { data, error } = await supabase.rpc("issue_course_certificate", {
    p_user_id: userId,
    p_course_id: courseId,
    p_issued_by: auth.user.id,
    p_manual_override: manualOverride,
    p_manual_reason: manualReason,
    p_site_url: siteUrl
  });

  if (error) throw new Error(error.message);
  const certificateId = typeof data === "string" ? data : null;

  await writeAuditEvent({
    actorId: auth.user.id,
    action: manualOverride ? "certificate.manual_issue" : "certificate.issue",
    target: certificateId ?? undefined,
    targetTable: "certificates",
    targetId: certificateId ?? undefined,
    metadata: { userId, courseId, manualOverride, manualReason }
  });
  await notifyCertificate(userId, certificateId);
  revalidatePath("/admin/certificates");
  revalidatePath("/dashboard/certificates");
}

export async function revokeCertificateAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const { data, error } = await supabase.from("certificates").update({ revoked_at: new Date().toISOString() }).eq("id", id).select("id, user_id").single();
  if (error) throw new Error(error.message);

  await writeAuditEvent({ actorId: auth.user.id, action: "certificate.revoke", target: id, targetTable: "certificates", targetId: id });
  await notifyCertificate(data?.user_id, data?.id, true);
  revalidatePath("/admin/certificates");
  revalidatePath("/dashboard/certificates");
}
