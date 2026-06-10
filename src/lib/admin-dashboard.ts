import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv, type BatchSummary, type CourseSummary, type LessonSummary } from "@/lib/lms";
import type { UserRole } from "@/lib/permissions";

interface QueryResult { data: unknown; error: { message: string } | null; count?: number | null }
type Relation<T> = T | T[] | null;

export interface AdminMetric { label: string; value: string; detail: string }
export interface AdminUserRow { id: string; full_name: string | null; email: string | null; phone_number: string | null; onboarding_completed: boolean | null; is_locked: boolean | null; created_at: string | null; admin_roles?: Relation<{ role: UserRole; revoked_at: string | null }> }
export interface AdminEnrollmentRow { id: string; user_id: string; course_id: string; batch_id: string | null; status: string; activation_status: string | null; created_at: string; profiles?: Relation<Pick<AdminUserRow, "full_name" | "email">>; courses?: Relation<Pick<CourseSummary, "title">>; batches?: Relation<Pick<BatchSummary, "title">> }
export interface AdminProductRow { id: string; title: string; slug: string; category: string | null; price_bdt: number | null; access_type: string | null; status: string | null; created_at: string }
export interface AdminOrderRow { id: string; order_number: string | null; user_id: string | null; status: string; payment_status: string | null; total_bdt: number | null; created_at: string; profiles?: Relation<Pick<AdminUserRow, "full_name" | "email">> }
export interface AdminPaymentRow { id: string; order_id: string | null; user_id: string | null; provider: string | null; transaction_id: string | null; amount_bdt: number | null; status: string; created_at: string }
export interface AdminWebhookLogRow { id: string; provider: string | null; transaction_id: string | null; event_type: string | null; status: string | null; created_at: string }
export interface AdminAssignmentRow { id: string; title: string; due_at: string | null; status: string | null; course_id: string | null; created_at: string; courses?: Relation<Pick<CourseSummary, "title">> }
export interface AdminSubmissionRow { id: string; assignment_id: string; user_id: string; status: string; grade: number | null; submitted_at: string | null; assignments?: Relation<Pick<AdminAssignmentRow, "title">>; profiles?: Relation<Pick<AdminUserRow, "full_name" | "email">> }
export interface AdminTicketRow { id: string; user_id: string | null; subject: string; status: string; priority: string | null; category: string | null; created_at: string; profiles?: Relation<Pick<AdminUserRow, "full_name" | "email">> }
export interface AdminContactRow { id: string; full_name: string | null; email: string | null; subject: string | null; status: string | null; created_at: string }
export interface AdminReviewRow { id: string; user_id: string | null; rating: number | null; title: string | null; status: string | null; created_at: string; profiles?: Relation<Pick<AdminUserRow, "full_name" | "email">> }
export interface AdminCertificateRow { id: string; user_id: string; course_id: string | null; certificate_number: string; verification_code: string; issued_at: string; revoked_at: string | null; profiles?: Relation<Pick<AdminUserRow, "full_name" | "email">>; courses?: Relation<Pick<CourseSummary, "title">> }
export interface AdminAuditLogRow { id: string; actor_id: string | null; action: string; target_table: string | null; target_id: string | null; created_at: string }
export interface AdminSettingsSnapshot { siteUrl: string; downloadsBucket: string; hasServiceRole: boolean; hasSupabaseUrl: boolean }

const empty = <T>() => [] as T[];
const canUseAdmin = () => hasSupabaseAdminEnv();

async function readList<T>(query: PromiseLike<QueryResult>): Promise<T[]> {
  try {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as T[];
  } catch (error) {
    console.warn(error instanceof Error ? error.message : error);
    return empty<T>();
  }
}

async function readCount(query: PromiseLike<QueryResult>) {
  try {
    const { count, error } = await query;
    if (error) throw new Error(error.message);
    return count ?? 0;
  } catch (error) {
    console.warn(error instanceof Error ? error.message : error);
    return 0;
  }
}

export function firstAdminRelation<T>(value: Relation<T> | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function getAdminAnalytics(): Promise<AdminMetric[]> {
  if (!canUseAdmin()) return [];
  const supabase = createAdminClient();
  const [students, activeStudents, pendingOrders, successfulPayments, activeEnrollments, paidOrders, submissions, assignments, completedLessons, watchRows, openTickets, resolvedTickets] = await Promise.all([
    readCount(supabase.from("profiles").select("id", { count: "exact", head: true })),
    readCount(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("onboarding_completed", true)),
    readCount(supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending")),
    readCount(supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "successful")),
    readCount(supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "active")),
    readList<Pick<AdminOrderRow, "total_bdt">>(supabase.from("orders").select("total_bdt").eq("payment_status", "paid").limit(1000)),
    readCount(supabase.from("assignment_submissions").select("id", { count: "exact", head: true })),
    readCount(supabase.from("assignments").select("id", { count: "exact", head: true })),
    readCount(supabase.from("watch_analytics").select("id", { count: "exact", head: true }).not("completed_at", "is", null)),
    readCount(supabase.from("watch_analytics").select("id", { count: "exact", head: true })),
    readCount(supabase.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "pending"])),
    readCount(supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "resolved"))
  ]);
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total_bdt ?? 0), 0);
  const submissionRate = assignments ? Math.round((submissions / assignments) * 100) : 0;
  const completionRate = watchRows ? Math.round((completedLessons / watchRows) * 100) : 0;
  return [
    { label: "Total students", value: students.toString(), detail: "Profiles created" },
    { label: "Active students", value: activeStudents.toString(), detail: "Onboarded users" },
    { label: "Pending orders", value: pendingOrders.toString(), detail: "Awaiting payment or review" },
    { label: "Successful payments", value: successfulPayments.toString(), detail: "Paid payment rows" },
    { label: "Active enrollments", value: activeEnrollments.toString(), detail: "Currently unlocked" },
    { label: "Total revenue", value: formatBdt(revenue), detail: "Paid orders" },
    { label: "Assignment submission rate", value: `${submissionRate}%`, detail: `${submissions}/${assignments}` },
    { label: "Lesson completion rate", value: `${completionRate}%`, detail: `${completedLessons}/${watchRows}` },
    { label: "Support ticket status", value: `${openTickets} open`, detail: `${resolvedTickets} resolved` }
  ];
}

export async function getAdminUsers() { if (!canUseAdmin()) return empty<AdminUserRow>(); return readList<AdminUserRow>(createAdminClient().from("profiles").select("id, full_name, email, phone_number, onboarding_completed, is_locked, created_at, admin_roles(role, revoked_at)").order("created_at", { ascending: false }).limit(100)); }
export async function getAdminCourses() { if (!canUseAdmin()) return empty<CourseSummary>(); return readList<CourseSummary>(createAdminClient().from("courses").select("id, title, slug, description, status, price_bdt, is_featured, published_at").order("created_at", { ascending: false }).limit(100)); }
export async function getAdminBatches() { if (!canUseAdmin()) return empty<BatchSummary>(); return readList<BatchSummary>(createAdminClient().from("batches").select("id, course_id, title, status, starts_at, ends_at, capacity").order("created_at", { ascending: false }).limit(100)); }
export async function getAdminLessons() { if (!canUseAdmin()) return empty<LessonSummary>(); return readList<LessonSummary>(createAdminClient().from("course_lessons").select("id, course_id, batch_id, title, description, position, duration_seconds, is_preview, is_locked, status").order("position", { ascending: true }).limit(200)); }
export async function getAdminProducts() { if (!canUseAdmin()) return empty<AdminProductRow>(); return readList<AdminProductRow>(createAdminClient().from("products").select("id, title, slug, category, price_bdt, access_type, status, created_at").order("created_at", { ascending: false }).limit(100)); }
export async function getAdminOrders() { if (!canUseAdmin()) return empty<AdminOrderRow>(); return readList<AdminOrderRow>(createAdminClient().from("orders").select("id, order_number, user_id, status, payment_status, total_bdt, created_at, profiles(full_name, email)").order("created_at", { ascending: false }).limit(100)); }
export async function getAdminEnrollments() { if (!canUseAdmin()) return empty<AdminEnrollmentRow>(); return readList<AdminEnrollmentRow>(createAdminClient().from("enrollments").select("id, user_id, course_id, batch_id, status, activation_status, created_at, profiles(full_name, email), courses(title), batches(title)").order("created_at", { ascending: false }).limit(100)); }
export async function getAdminTickets() { if (!canUseAdmin()) return empty<AdminTicketRow>(); return readList<AdminTicketRow>(createAdminClient().from("support_tickets").select("id, user_id, subject, status, priority, category, created_at, profiles(full_name, email)").order("created_at", { ascending: false }).limit(100)); }
export async function getAdminContacts() { if (!canUseAdmin()) return empty<AdminContactRow>(); return readList<AdminContactRow>(createAdminClient().from("contact_messages").select("id, full_name, email, subject, status, created_at").order("created_at", { ascending: false }).limit(100)); }
export async function getAdminReviews() { if (!canUseAdmin()) return empty<AdminReviewRow>(); return readList<AdminReviewRow>(createAdminClient().from("reviews").select("id, user_id, rating, title, status, created_at, profiles(full_name, email)").order("created_at", { ascending: false }).limit(100)); }
export async function getAdminCertificates() { if (!canUseAdmin()) return empty<AdminCertificateRow>(); return readList<AdminCertificateRow>(createAdminClient().from("certificates").select("id, user_id, course_id, certificate_number, verification_code, issued_at, revoked_at, profiles(full_name, email), courses(title)").order("issued_at", { ascending: false }).limit(100)); }
export async function getAdminAuditLogs() { if (!canUseAdmin()) return empty<AdminAuditLogRow>(); return readList<AdminAuditLogRow>(createAdminClient().from("audit_logs").select("id, actor_id, action, target_table, target_id, created_at").order("created_at", { ascending: false }).limit(100)); }

export async function getAdminPayments() {
  if (!canUseAdmin()) return { payments: empty<AdminPaymentRow>(), webhookLogs: empty<AdminWebhookLogRow>() };
  const supabase = createAdminClient();
  const [payments, webhookLogs] = await Promise.all([
    readList<AdminPaymentRow>(supabase.from("payments").select("id, order_id, user_id, provider, transaction_id, amount_bdt, status, created_at").order("created_at", { ascending: false }).limit(100)),
    readList<AdminWebhookLogRow>(supabase.from("payment_webhook_logs").select("id, provider, transaction_id, event_type, status, created_at").order("created_at", { ascending: false }).limit(100))
  ]);
  return { payments, webhookLogs };
}

export async function getAdminAssignments() {
  if (!canUseAdmin()) return { assignments: empty<AdminAssignmentRow>(), submissions: empty<AdminSubmissionRow>() };
  const supabase = createAdminClient();
  const [assignments, submissions] = await Promise.all([
    readList<AdminAssignmentRow>(supabase.from("assignments").select("id, title, due_at, status, course_id, created_at, courses(title)").order("created_at", { ascending: false }).limit(100)),
    readList<AdminSubmissionRow>(supabase.from("assignment_submissions").select("id, assignment_id, user_id, status, grade, submitted_at, assignments(title), profiles(full_name, email)").order("submitted_at", { ascending: false }).limit(100))
  ]);
  return { assignments, submissions };
}

export async function getAdminSettings(): Promise<AdminSettingsSnapshot> {
  return { siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://plickify.vercel.app", downloadsBucket: process.env.SUPABASE_DOWNLOADS_BUCKET ?? "downloads", hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) };
}

export function formatBdt(value: number | null | undefined) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(Number(value ?? 0));
}
