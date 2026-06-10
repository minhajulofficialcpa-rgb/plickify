import "server-only";
import { createClient } from "@/lib/supabase/server";
import { firstRelation, type BatchSummary, type CourseSummary, type EnrollmentSummary, type LessonSummary } from "@/lib/lms";

export interface DashboardStats {
  enrolledCourses: number;
  activeBatches: number;
  lessonProgress: number;
  pendingAssignments: number;
  orders: number;
  notifications: number;
  certificates: number;
}

export interface StudentAssignmentSubmission {
  id: string;
  status: string;
  submission_text: string | null;
  submission_url: string | null;
  github_url: string | null;
  attachment_url: string | null;
  marks: number | null;
  score?: number | null;
  feedback: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export interface AssignmentSummary {
  id: string;
  title: string;
  instructions: string | null;
  due_at: string | null;
  max_marks?: number | null;
  max_score?: number | null;
  attachment_url: string | null;
  status?: string | null;
  courses?: Pick<CourseSummary, "title"> | Pick<CourseSummary, "title">[] | null;
  batches?: Pick<BatchSummary, "title"> | Pick<BatchSummary, "title">[] | null;
  assignment_submissions?: StudentAssignmentSubmission | StudentAssignmentSubmission[] | null;
}

export interface OrderSummary {
  id: string;
  order_number: string | null;
  status: string;
  payment_status: string | null;
  activation_status: string | null;
  access_type: string | null;
  item_type: string | null;
  total_bdt: number | null;
  created_at: string;
  products?: { title: string; category: string | null } | Array<{ title: string; category: string | null }> | null;
}

export interface DownloadSummary {
  id: string;
  product_id: string | null;
  order_id: string | null;
  status: string | null;
  download_count: number | null;
  max_downloads: number | null;
  expires_at: string | null;
  last_downloaded_at: string | null;
  products?: { title: string; category: string | null } | Array<{ title: string; category: string | null }> | null;
}

export interface CertificateSummary {
  id: string;
  certificate_number: string;
  verification_code: string;
  issued_at: string;
  revoked_at: string | null;
  courses?: Pick<CourseSummary, "title"> | Pick<CourseSummary, "title">[] | null;
}

export interface SupportMessageSummary {
  id: string;
  sender_id: string;
  sender_role: string | null;
  message: string;
  attachment_url: string | null;
  created_at: string;
}

export interface SupportTicketSummary {
  id: string;
  subject: string;
  message: string | null;
  status: string;
  priority: string | null;
  category: string | null;
  created_at: string;
  support_messages?: SupportMessageSummary[] | null;
}

export interface NotificationSummary {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export interface LessonProgressSummary extends LessonSummary {
  last_position_seconds: number;
  completed_at: string | null;
  courses?: Pick<CourseSummary, "title"> | Pick<CourseSummary, "title">[] | null;
}

function emptyStats(): DashboardStats {
  return { enrolledCourses: 0, activeBatches: 0, lessonProgress: 0, pendingAssignments: 0, orders: 0, notifications: 0, certificates: 0 };
}

function logReadError(error: unknown) {
  if (error instanceof Error) console.warn(error.message);
}

async function readList<T>(query: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  try {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as T[];
  } catch (error) {
    logReadError(error);
    return [];
  }
}

export async function getStudentDashboardSnapshot(userId: string) {
  const [courses, batches, lessons, assignments, orders, notifications, certificates] = await Promise.all([
    getStudentCourses(userId),
    getStudentBatches(userId),
    getStudentLessonProgress(userId),
    getStudentAssignments(userId),
    getStudentOrders(userId),
    getStudentNotifications(userId),
    getStudentCertificates(userId)
  ]);

  return {
    stats: {
      ...emptyStats(),
      enrolledCourses: courses.filter((item) => item.status === "active").length,
      activeBatches: batches.filter((item) => item.status === "active").length,
      lessonProgress: lessons.length,
      pendingAssignments: assignments.filter((item) => !firstRelation(item.assignment_submissions)).length,
      orders: orders.length,
      notifications: notifications.filter((item) => !item.read_at).length,
      certificates: certificates.length
    },
    courses,
    batches,
    lessons,
    assignments,
    orders,
    notifications,
    certificates
  };
}

export async function getStudentCourses(userId: string) {
  const supabase = await createClient();
  return readList<EnrollmentSummary>(supabase.from("enrollments").select("id, user_id, course_id, batch_id, status, activation_status, created_at, courses(id, title, slug, description, status, price_bdt, published_at), batches(id, course_id, title, status, starts_at, ends_at, capacity)").eq("user_id", userId).order("created_at", { ascending: false }));
}

export async function getStudentBatches(userId: string) {
  const supabase = await createClient();
  return readList<{ id: string; user_id: string; course_id: string; batch_id: string; status: string; created_at: string; courses?: CourseSummary | CourseSummary[] | null; batches?: BatchSummary | BatchSummary[] | null }>(supabase.from("user_batches").select("id, user_id, course_id, batch_id, status, created_at, courses(id, title, slug, description, status, price_bdt, published_at), batches(id, course_id, title, status, starts_at, ends_at, capacity)").eq("user_id", userId).order("created_at", { ascending: false }));
}

export async function getStudentLessonProgress(userId: string) {
  const supabase = await createClient();
  const rows = await readList<{ id: string; last_position_seconds: number | null; completed_at: string | null; course_lessons?: LessonProgressSummary | LessonProgressSummary[] | null }>(supabase.from("watch_analytics").select("id, last_position_seconds, completed_at, course_lessons(id, course_id, batch_id, title, description, position, duration_seconds, is_preview, is_locked, status, courses(title))").eq("user_id", userId).order("updated_at", { ascending: false }).limit(20));

  return rows.flatMap((row) => {
    const lesson = firstRelation(row.course_lessons);
    if (!lesson) return [];
    return [{ ...lesson, last_position_seconds: Number(row.last_position_seconds ?? 0), completed_at: row.completed_at }];
  });
}

export async function getStudentAssignments(userId: string) {
  const supabase = await createClient();
  return readList<AssignmentSummary>(supabase.from("assignments").select("id, title, instructions, due_at, max_marks, max_score, attachment_url, status, courses(title), batches(title), assignment_submissions!left(id, status, submission_text, submission_url, github_url, attachment_url, marks, score, feedback, submitted_at, reviewed_at)").eq("status", "published").eq("assignment_submissions.user_id", userId).order("due_at", { ascending: true }).limit(50));
}

export async function getStudentOrders(userId: string) {
  const supabase = await createClient();
  return readList<OrderSummary>(supabase.from("orders").select("id, order_number, status, payment_status, activation_status, access_type, item_type, total_bdt, created_at, products(title, category)").eq("user_id", userId).order("created_at", { ascending: false }).limit(25));
}

export async function getStudentDownloads(userId: string) {
  const supabase = await createClient();
  return readList<DownloadSummary>(supabase.from("downloads").select("id, product_id, order_id, status, download_count, max_downloads, expires_at, last_downloaded_at, products(title, category)").eq("user_id", userId).eq("status", "active").order("created_at", { ascending: false }).limit(25));
}

export async function getStudentCertificates(userId: string) {
  const supabase = await createClient();
  return readList<CertificateSummary>(supabase.from("certificates").select("id, certificate_number, verification_code, issued_at, revoked_at, courses(title)").eq("user_id", userId).order("issued_at", { ascending: false }).limit(25));
}

export async function getStudentSupportTickets(userId: string) {
  const supabase = await createClient();
  return readList<SupportTicketSummary>(supabase.from("support_tickets").select("id, subject, message, status, priority, category, created_at, support_messages(id, sender_id, sender_role, message, attachment_url, created_at)").eq("user_id", userId).order("created_at", { ascending: false }).limit(25));
}

export async function getStudentNotifications(userId: string) {
  const supabase = await createClient();
  return readList<NotificationSummary>(supabase.from("notifications").select("id, title, body, read_at, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(25));
}
