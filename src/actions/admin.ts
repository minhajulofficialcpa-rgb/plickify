"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { writeAuditEvent } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/lms";

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

function numberValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value === null ? null : Number(value);
}

function checkbox(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true";
}

async function audit(actorId: string, action: string, targetTable: string, targetId?: string | null, metadata?: Record<string, unknown>) {
  await writeAuditEvent({ actorId, action, target: targetId ?? undefined, targetTable, targetId: targetId ?? undefined, metadata });
}

function revalidateAdmin(path: string) {
  revalidatePath(path);
  revalidatePath("/admin");
}

export async function saveProductAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const id = text(formData, "id");
  const payload = {
    title: requiredText(formData, "title"),
    slug: requiredText(formData, "slug"),
    category: text(formData, "category"),
    price_bdt: numberValue(formData, "priceBdt") ?? 0,
    access_type: text(formData, "accessType") ?? "download",
    description: text(formData, "description"),
    file_path: text(formData, "filePath"),
    status: text(formData, "status") ?? "draft"
  };
  const { error } = id ? await supabase.from("products").update(payload).eq("id", id) : await supabase.from("products").insert(payload);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, id ? "product.update" : "product.create", "products", id, { slug: payload.slug });
  revalidateAdmin("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "product.delete", "products", id);
  revalidateAdmin("/admin/products");
}

export async function updateUserLockAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const isLocked = checkbox(formData, "isLocked");
  const { error } = await supabase.from("profiles").update({ is_locked: isLocked }).eq("id", id);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, isLocked ? "user.lock" : "user.unlock", "profiles", id);
  revalidateAdmin("/admin/users");
}

export async function grantRoleAction(formData: FormData) {
  const auth = await requireSuperAdmin();
  const supabase = ensureAdminEnv();
  const userId = requiredText(formData, "userId");
  const role = requiredText(formData, "role");
  const { error } = await supabase.from("admin_roles").insert({ user_id: userId, role, granted_by: auth.user.id });
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "role.grant", "admin_roles", userId, { role });
  revalidateAdmin("/admin/users");
}

export async function updateEnrollmentStatusAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const status = text(formData, "status") ?? "active";
  const { error } = await supabase.from("enrollments").update({ status, activation_status: status === "active" ? "active" : status }).eq("id", id);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "enrollment.status_update", "enrollments", id, { status });
  revalidateAdmin("/admin/enrollments");
}

export async function grantFreeAccessAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const userId = requiredText(formData, "userId");
  const courseId = requiredText(formData, "courseId");
  const batchId = text(formData, "batchId");
  const { data, error } = await supabase.from("enrollments").insert({ user_id: userId, course_id: courseId, batch_id: batchId, status: "active", activation_status: "active", source: "free_access" }).select("id").single();
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "enrollment.free_access", "enrollments", data?.id, { userId, courseId, batchId });
  revalidateAdmin("/admin/enrollments");
}

export async function resolveTicketAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const status = text(formData, "status") ?? "resolved";
  const { error } = await supabase.from("support_tickets").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "support_ticket.status_update", "support_tickets", id, { status });
  revalidateAdmin("/admin/tickets");
}

export async function updateContactStatusAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const status = text(formData, "status") ?? "reviewed";
  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "contact.status_update", "contact_messages", id, { status });
  revalidateAdmin("/admin/contacts");
}

export async function updateReviewStatusAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const status = text(formData, "status") ?? "approved";
  const { error } = await supabase.from("reviews").update({ status, approved_at: status === "approved" ? new Date().toISOString() : null }).eq("id", id);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "review.status_update", "reviews", id, { status });
  revalidateAdmin("/admin/reviews");
}

export async function updateAssignmentSubmissionAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const status = text(formData, "status") ?? "reviewed";
  const grade = numberValue(formData, "grade");
  const { error } = await supabase.from("assignment_submissions").update({ status, grade }).eq("id", id);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "assignment_submission.review", "assignment_submissions", id, { status, grade });
  revalidateAdmin("/admin/assignments");
}

export async function saveAssignmentAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const id = text(formData, "id");
  const payload = { course_id: text(formData, "courseId"), title: requiredText(formData, "title"), description: text(formData, "description"), due_at: text(formData, "dueAt"), status: text(formData, "status") ?? "published" };
  const { error } = id ? await supabase.from("assignments").update(payload).eq("id", id) : await supabase.from("assignments").insert(payload);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, id ? "assignment.update" : "assignment.create", "assignments", id, { title: payload.title });
  revalidateAdmin("/admin/assignments");
}

export async function issueCertificateAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const userId = requiredText(formData, "userId");
  const courseId = requiredText(formData, "courseId");
  const certificateNumber = requiredText(formData, "certificateNumber");
  const verificationCode = requiredText(formData, "verificationCode");
  const { data, error } = await supabase.from("certificates").insert({ user_id: userId, course_id: courseId, certificate_number: certificateNumber, verification_code: verificationCode }).select("id").single();
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "certificate.issue", "certificates", data?.id, { userId, courseId });
  revalidateAdmin("/admin/certificates");
}

export async function revokeCertificateAction(formData: FormData) {
  const auth = await requireAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const { error } = await supabase.from("certificates").update({ revoked_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "certificate.revoke", "certificates", id);
  revalidateAdmin("/admin/certificates");
}
