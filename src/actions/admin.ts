"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin, requireSuperAdmin, requireSupportModerator } from "@/lib/auth";
import { writeAuditEvent } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/lms";
import { assignmentMutationSchema, assignmentReviewSchema, supportReplySchema, supportTicketStatusSchema } from "@/lib/validations";

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

async function notify(userId: string | null | undefined, title: string, body: string, actionUrl: string, relatedType: string, relatedId: string) {
  if (!userId) return;
  const supabase = ensureAdminEnv();
  await supabase.from("notifications").insert({ user_id: userId, title, body, action_url: actionUrl, related_type: relatedType, related_id: relatedId });
}

function revalidateAdmin(path: string) {
  revalidatePath(path);
  revalidatePath("/admin");
}

export async function saveProductAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
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
  const auth = await requirePlatformAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "product.delete", "products", id);
  revalidateAdmin("/admin/products");
}

export async function updateUserLockAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
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
  const auth = await requirePlatformAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const status = text(formData, "status") ?? "active";
  const { data, error } = await supabase.from("enrollments").update({ status, activation_status: status === "active" ? "active" : status }).eq("id", id).select("user_id").single();
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "enrollment.status_update", "enrollments", id, { status });
  await notify(data?.user_id, "Enrollment updated", `Enrollment status changed to ${status}.`, "/dashboard/courses", "enrollment", id);
  revalidateAdmin("/admin/enrollments");
}

export async function grantFreeAccessAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
  const supabase = ensureAdminEnv();
  const userId = requiredText(formData, "userId");
  const courseId = requiredText(formData, "courseId");
  const batchId = text(formData, "batchId");
  const { data, error } = await supabase.from("enrollments").insert({ user_id: userId, course_id: courseId, batch_id: batchId, status: "active", activation_status: "active", source: "free_access" }).select("id").single();
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "enrollment.free_access", "enrollments", data?.id, { userId, courseId, batchId });
  await notify(userId, "Course access granted", "An admin granted free course access.", "/dashboard/courses", "enrollment", data?.id);
  revalidateAdmin("/admin/enrollments");
}

export async function updateTicketStatusAction(formData: FormData) {
  const auth = await requireSupportModerator();
  const supabase = ensureAdminEnv();
  const input = supportTicketStatusSchema.parse({ id: requiredText(formData, "id"), status: requiredText(formData, "status"), priority: requiredText(formData, "priority") });
  const closing = input.status === "resolved" || input.status === "closed";
  const { data, error } = await supabase
    .from("support_tickets")
    .update({ status: input.status, priority: input.priority, closed_at: closing ? new Date().toISOString() : null, closed_by: closing ? auth.user.id : null })
    .eq("id", input.id)
    .select("id, user_id, subject")
    .single();
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "support_ticket.status_update", "support_tickets", input.id, { status: input.status, priority: input.priority });
  await notify(data?.user_id, "Support ticket updated", `${data?.subject ?? "Ticket"} is now ${input.status}.`, "/dashboard/support", "support_ticket", input.id);
  revalidateAdmin("/admin/tickets");
  revalidatePath("/dashboard/support");
}

export const resolveTicketAction = updateTicketStatusAction;

export async function replySupportTicketAsStaffAction(formData: FormData) {
  const auth = await requireSupportModerator();
  const supabase = ensureAdminEnv();
  const input = supportReplySchema.parse({ ticketId: requiredText(formData, "ticketId"), message: requiredText(formData, "message"), attachmentUrl: text(formData, "attachmentUrl") ?? "" });
  const { data: ticket, error: ticketError } = await supabase.from("support_tickets").select("id, user_id, subject, status").eq("id", input.ticketId).single();
  if (ticketError) throw new Error(ticketError.message);
  if (["resolved", "closed"].includes(String(ticket?.status))) throw new Error("This ticket is already closed.");

  const { error } = await supabase.from("support_messages").insert({
    ticket_id: input.ticketId,
    sender_id: auth.user.id,
    sender_role: auth.role === "super_admin" ? "super_admin" : auth.role === "admin" ? "admin" : "support_moderator",
    message: input.message,
    attachment_url: input.attachmentUrl || null
  });
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "support_ticket.reply", "support_tickets", input.ticketId);
  await notify(ticket?.user_id, "Support replied", ticket?.subject ?? "Your support ticket has a new reply.", "/dashboard/support", "support_ticket", input.ticketId);
  revalidateAdmin("/admin/tickets");
  revalidatePath("/dashboard/support");
}

export async function updateContactStatusAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const status = text(formData, "status") ?? "reviewed";
  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "contact.status_update", "contact_messages", id, { status });
  revalidateAdmin("/admin/contacts");
}

export async function updateReviewStatusAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const status = text(formData, "status") ?? "approved";
  const { error } = await supabase.from("reviews").update({ status, approved_at: status === "approved" ? new Date().toISOString() : null }).eq("id", id);
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "review.status_update", "reviews", id, { status });
  revalidateAdmin("/admin/reviews");
}

export async function updateAssignmentSubmissionAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
  const supabase = ensureAdminEnv();
  const input = assignmentReviewSchema.parse({ id: requiredText(formData, "id"), status: requiredText(formData, "status"), marks: numberValue(formData, "marks") ?? numberValue(formData, "grade") ?? undefined, feedback: text(formData, "feedback") ?? "" });
  const { data, error } = await supabase.from("assignment_submissions").update({
    status: input.status,
    score: input.marks ?? null,
    marks: input.marks ?? null,
    feedback: input.feedback || null,
    graded_by: auth.user.id,
    reviewed_by: auth.user.id,
    graded_at: new Date().toISOString(),
    reviewed_at: new Date().toISOString()
  }).eq("id", input.id).select("id, user_id, assignment_id, assignments(title)").single();
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "assignment_submission.review", "assignment_submissions", input.id, { status: input.status, marks: input.marks });
  await notify(data?.user_id, "Assignment reviewed", "Marks and feedback are available in your dashboard.", "/dashboard/assignments", "assignment", data?.assignment_id);
  revalidateAdmin("/admin/assignments");
  revalidatePath("/dashboard/assignments");
}

export async function saveAssignmentAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
  const supabase = ensureAdminEnv();
  const input = assignmentMutationSchema.parse({
    id: text(formData, "id") ?? "",
    courseId: requiredText(formData, "courseId"),
    batchId: requiredText(formData, "batchId"),
    title: requiredText(formData, "title"),
    instructions: text(formData, "instructions") ?? text(formData, "description") ?? "",
    deadline: text(formData, "deadline") ?? text(formData, "dueAt") ?? "",
    maxMarks: numberValue(formData, "maxMarks") ?? numberValue(formData, "maxScore") ?? 100,
    attachmentUrl: text(formData, "attachmentUrl") ?? "",
    status: text(formData, "status") ?? "published"
  });
  const id = input.id || null;
  const payload = {
    course_id: input.courseId,
    batch_id: input.batchId,
    title: input.title,
    instructions: input.instructions || null,
    due_at: input.deadline || null,
    max_score: input.maxMarks,
    max_marks: input.maxMarks,
    attachment_url: input.attachmentUrl || null,
    status: input.status,
    created_by: auth.user.id
  };
  const { data, error } = id
    ? await supabase.from("assignments").update(payload).eq("id", id).select("id").single()
    : await supabase.from("assignments").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  await audit(auth.user.id, id ? "assignment.update" : "assignment.create", "assignments", data?.id ?? id, { title: payload.title, batchId: payload.batch_id });
  revalidateAdmin("/admin/assignments");
  revalidatePath("/dashboard/assignments");
}

export async function issueCertificateAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
  const supabase = ensureAdminEnv();
  const userId = requiredText(formData, "userId");
  const courseId = requiredText(formData, "courseId");
  const certificateNumber = requiredText(formData, "certificateNumber");
  const verificationCode = requiredText(formData, "verificationCode");
  const { data, error } = await supabase.from("certificates").insert({ user_id: userId, course_id: courseId, certificate_number: certificateNumber, verification_code: verificationCode }).select("id").single();
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "certificate.issue", "certificates", data?.id, { userId, courseId });
  await notify(userId, "Certificate issued", "Your certificate is available in your dashboard.", "/dashboard/certificates", "certificate", data?.id);
  revalidateAdmin("/admin/certificates");
}

export async function revokeCertificateAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
  const supabase = ensureAdminEnv();
  const id = requiredText(formData, "id");
  const { data, error } = await supabase.from("certificates").update({ revoked_at: new Date().toISOString() }).eq("id", id).select("id, user_id").single();
  if (error) throw new Error(error.message);
  await audit(auth.user.id, "certificate.revoke", "certificates", id);
  await notify(data?.user_id, "Certificate revoked", "A certificate was revoked by admin.", "/dashboard/certificates", "certificate", id);
  revalidateAdmin("/admin/certificates");
}
