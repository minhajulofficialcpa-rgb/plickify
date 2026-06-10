import "server-only";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { canManageContent, type UserRole } from "@/lib/permissions";

export type EnrollmentStatus = "pending" | "active" | "cancelled" | "completed" | "expired";

export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  price_bdt: number;
  is_featured?: boolean | null;
  published_at: string | null;
}

export interface BatchSummary {
  id: string;
  course_id: string;
  title: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  capacity: number | null;
}

export interface LessonSummary {
  id: string;
  course_id: string;
  batch_id: string | null;
  title: string;
  description: string | null;
  position: number;
  duration_seconds: number;
  is_preview: boolean;
  is_locked: boolean;
  status: string;
}

export interface EnrollmentSummary {
  id: string;
  user_id: string;
  course_id: string;
  batch_id: string | null;
  status: EnrollmentStatus;
  activation_status: string | null;
  created_at: string;
  courses?: CourseSummary | CourseSummary[] | null;
  batches?: BatchSummary | BatchSummary[] | null;
}

export interface WatchProgress {
  last_position_seconds: number;
  completed_at: string | null;
}

export interface LessonAccess {
  lesson: LessonSummary & {
    content: string | null;
    video_url: string | null;
    youtube_video_id: string | null;
    courses?: Pick<CourseSummary, "id" | "title" | "slug"> | Pick<CourseSummary, "id" | "title" | "slug">[] | null;
    batches?: Pick<BatchSummary, "id" | "title"> | Pick<BatchSummary, "id" | "title">[] | null;
  };
  progress: WatchProgress;
}

export function hasSupabaseAdminEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function requireContentManager() {
  const auth = await requireOnboardedUser();
  if (!canManageContent(auth.role)) redirect("/dashboard");
  return auth;
}

export function canEditContent(role: UserRole) {
  return canManageContent(role);
}

export async function getStudentLearningHome(userId: string) {
  const supabase = await createClient();

  const [{ data: enrollments }, { data: userBatches }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, user_id, course_id, batch_id, status, activation_status, created_at, courses(id, title, slug, description, status, price_bdt, published_at), batches(id, course_id, title, status, starts_at, ends_at, capacity)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_batches")
      .select("id, user_id, course_id, batch_id, status, created_at, batches(id, course_id, title, status, starts_at, ends_at, capacity), courses(id, title, slug, description, status, price_bdt, published_at)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  ]);

  return {
    enrollments: (enrollments ?? []) as EnrollmentSummary[],
    userBatches: (userBatches ?? []) as Array<{ id: string; status: string; courses?: CourseSummary | CourseSummary[] | null; batches?: BatchSummary | BatchSummary[] | null }>
  };
}

export async function getAccessibleCourseLessons(userId: string, courseId: string) {
  const supabase = await createClient();
  const hasAccess = await userHasActiveCourseAccess(userId, courseId);
  if (!hasAccess) return null;

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, description, status, price_bdt, published_at")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) return null;

  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("id, course_id, batch_id, title, description, position, duration_seconds, is_preview, is_locked, status")
    .eq("course_id", courseId)
    .eq("status", "published")
    .order("position", { ascending: true });

  return {
    course: course as CourseSummary,
    lessons: ((lessons ?? []) as LessonSummary[]).filter((lesson) => !lesson.is_locked || hasAccess)
  };
}

export async function requireLessonAccess(lessonId: string): Promise<LessonAccess> {
  const { user, profile } = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("course_lessons")
    .select("id, course_id, batch_id, title, description, content, video_url, youtube_video_id, position, duration_seconds, is_preview, is_locked, status, courses(id, title, slug), batches(id, title)")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) notFound();

  const typedLesson = lesson as LessonAccess["lesson"];
  const hasAccess = await userHasLessonAccess(user.id, typedLesson.course_id, typedLesson.batch_id);
  if (!typedLesson.is_preview && (!hasAccess || typedLesson.is_locked)) redirect("/dashboard");

  const { data: progress } = await supabase
    .from("watch_analytics")
    .select("last_position_seconds, completed_at")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  return {
    lesson: typedLesson,
    progress: {
      last_position_seconds: Number(progress?.last_position_seconds ?? 0),
      completed_at: progress?.completed_at ?? null
    },
    profile
  } as LessonAccess;
}

export async function userHasActiveCourseAccess(userId: string, courseId: string) {
  const supabase = await createClient();
  const [{ data: enrollment }, { data: userBatch }] = await Promise.all([
    supabase.from("enrollments").select("id").eq("user_id", userId).eq("course_id", courseId).eq("status", "active").limit(1).maybeSingle(),
    supabase.from("user_batches").select("id").eq("user_id", userId).eq("course_id", courseId).eq("status", "active").limit(1).maybeSingle()
  ]);

  return Boolean(enrollment || userBatch);
}

export async function userHasLessonAccess(userId: string, courseId: string, batchId: string | null) {
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (enrollment && !batchId) return true;

  let batchQuery = supabase
    .from("user_batches")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("status", "active");

  if (batchId) batchQuery = batchQuery.eq("batch_id", batchId);

  const { data: userBatch } = await batchQuery.limit(1).maybeSingle();
  return Boolean(enrollment || userBatch);
}

export async function getAdminContentOverview() {
  const supabase = createAdminClient();
  const [courses, batches, lessons] = await Promise.all([
    supabase.from("courses").select("id, title, slug, description, status, price_bdt, is_featured, published_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("batches").select("id, course_id, title, status, starts_at, ends_at, capacity").order("created_at", { ascending: false }).limit(50),
    supabase.from("course_lessons").select("id, course_id, batch_id, title, description, position, duration_seconds, is_preview, is_locked, status").order("position", { ascending: true }).limit(100)
  ]);

  return {
    courses: (courses.data ?? []) as CourseSummary[],
    batches: (batches.data ?? []) as BatchSummary[],
    lessons: (lessons.data ?? []) as LessonSummary[]
  };
}

export function getYouTubeEmbedUrl(lesson: Pick<LessonAccess["lesson"], "youtube_video_id" | "video_url">) {
  const videoId = lesson.youtube_video_id ?? extractYouTubeVideoId(lesson.video_url);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1` : null;
}

function extractYouTubeVideoId(url: string | null | undefined) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? null;
}
