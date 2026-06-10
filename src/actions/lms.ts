"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { writeAuditEvent } from "@/lib/audit";
import { requireContentManager, requireLessonAccess, userHasLessonAccess } from "@/lib/lms";
import { requireOnboardedUser } from "@/lib/auth";
import {
  batchMutationSchema,
  courseMutationSchema,
  enrollmentMutationSchema,
  lessonMutationSchema,
  uuidSchema,
  watchHeartbeatSchema
} from "@/lib/validations";

export interface ActionState {
  ok: boolean;
  message: string;
}

const initialState: ActionState = { ok: true, message: "" };
const ok = (message: string): ActionState => ({ ok: true, message });
const fail = (message: string): ActionState => ({ ok: false, message });

function nullableText(value: string | undefined) {
  return value?.trim() ? value.trim() : null;
}

function checkbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export async function saveCourseFormAction(formData: FormData) {
  const result = await saveCourseAction(initialState, formData);
  if (!result.ok) throw new Error(result.message);
}

export async function saveBatchFormAction(formData: FormData) {
  const result = await saveBatchAction(initialState, formData);
  if (!result.ok) throw new Error(result.message);
}

export async function saveLessonFormAction(formData: FormData) {
  const result = await saveLessonAction(initialState, formData);
  if (!result.ok) throw new Error(result.message);
}

export async function saveCourseAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireContentManager();
  const parsed = courseMutationSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    title: formData.get("title")?.toString(),
    slug: formData.get("slug")?.toString(),
    description: formData.get("description")?.toString(),
    thumbnailUrl: formData.get("thumbnailUrl")?.toString(),
    priceBdt: formData.get("priceBdt")?.toString(),
    status: formData.get("status")?.toString(),
    isFeatured: checkbox(formData.get("isFeatured"))
  });

  if (!parsed.success) return fail("Course data is invalid.");

  const supabase = createAdminClient();
  const payload = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: nullableText(parsed.data.description),
    thumbnail_url: nullableText(parsed.data.thumbnailUrl),
    price_bdt: parsed.data.priceBdt,
    status: parsed.data.status,
    is_featured: Boolean(parsed.data.isFeatured),
    published_at: parsed.data.status === "published" ? new Date().toISOString() : null
  };

  const query = parsed.data.id
    ? supabase.from("courses").update(payload).eq("id", parsed.data.id)
    : supabase.from("courses").insert(payload);

  const { error } = await query;
  if (error) return fail(error.message);

  await writeAuditEvent({ actorId: auth.user.id, action: parsed.data.id ? "course.update" : "course.create", target: parsed.data.id, metadata: { slug: parsed.data.slug } });
  revalidatePath("/");
  revalidatePath("/admin/courses");
  return ok(parsed.data.id ? "Course updated." : "Course created.");
}

export async function deleteCourseAction(formData: FormData) {
  const auth = await requireContentManager();
  const id = uuidSchema.parse(formData.get("id")?.toString());
  const supabase = createAdminClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await writeAuditEvent({ actorId: auth.user.id, action: "course.delete", target: id });
  revalidatePath("/");
  revalidatePath("/admin/courses");
}

export async function saveBatchAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireContentManager();
  const parsed = batchMutationSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    courseId: formData.get("courseId")?.toString(),
    title: formData.get("title")?.toString(),
    status: formData.get("status")?.toString(),
    startsAt: formData.get("startsAt")?.toString(),
    endsAt: formData.get("endsAt")?.toString(),
    capacity: formData.get("capacity")?.toString() || undefined
  });

  if (!parsed.success) return fail("Batch data is invalid.");

  const payload = {
    course_id: parsed.data.courseId,
    title: parsed.data.title,
    status: parsed.data.status,
    starts_at: nullableText(parsed.data.startsAt),
    ends_at: nullableText(parsed.data.endsAt),
    capacity: parsed.data.capacity ?? null
  };

  const supabase = createAdminClient();
  const query = parsed.data.id
    ? supabase.from("batches").update(payload).eq("id", parsed.data.id)
    : supabase.from("batches").insert(payload);

  const { error } = await query;
  if (error) return fail(error.message);

  await writeAuditEvent({ actorId: auth.user.id, action: parsed.data.id ? "batch.update" : "batch.create", target: parsed.data.id, metadata: { courseId: parsed.data.courseId } });
  revalidatePath("/admin/courses");
  revalidatePath(`/courses/${parsed.data.courseId}`);
  return ok(parsed.data.id ? "Batch updated." : "Batch created.");
}

export async function deleteBatchAction(formData: FormData) {
  const auth = await requireContentManager();
  const id = uuidSchema.parse(formData.get("id")?.toString());
  const supabase = createAdminClient();
  const { error } = await supabase.from("batches").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await writeAuditEvent({ actorId: auth.user.id, action: "batch.delete", target: id });
  revalidatePath("/admin/courses");
}

export async function saveLessonAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await requireContentManager();
  const parsed = lessonMutationSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    courseId: formData.get("courseId")?.toString(),
    batchId: formData.get("batchId")?.toString() || "",
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString(),
    content: formData.get("content")?.toString(),
    videoUrl: formData.get("videoUrl")?.toString(),
    youtubeVideoId: formData.get("youtubeVideoId")?.toString(),
    position: formData.get("position")?.toString(),
    durationSeconds: formData.get("durationSeconds")?.toString(),
    status: formData.get("status")?.toString(),
    isPreview: checkbox(formData.get("isPreview")),
    isLocked: checkbox(formData.get("isLocked"))
  });

  if (!parsed.success) return fail("Lesson data is invalid.");

  const payload = {
    course_id: parsed.data.courseId,
    batch_id: parsed.data.batchId || null,
    title: parsed.data.title,
    description: nullableText(parsed.data.description),
    content: nullableText(parsed.data.content),
    video_url: nullableText(parsed.data.videoUrl),
    youtube_video_id: nullableText(parsed.data.youtubeVideoId),
    position: parsed.data.position,
    duration_seconds: parsed.data.durationSeconds,
    status: parsed.data.status,
    is_preview: Boolean(parsed.data.isPreview),
    is_locked: Boolean(parsed.data.isLocked)
  };

  const supabase = createAdminClient();
  const query = parsed.data.id
    ? supabase.from("course_lessons").update(payload).eq("id", parsed.data.id)
    : supabase.from("course_lessons").insert(payload);

  const { error } = await query;
  if (error) return fail(error.message);

  await writeAuditEvent({ actorId: auth.user.id, action: parsed.data.id ? "lesson.update" : "lesson.create", target: parsed.data.id, metadata: { courseId: parsed.data.courseId, batchId: parsed.data.batchId || null } });
  revalidatePath("/admin/courses");
  revalidatePath(`/dashboard/courses/${parsed.data.courseId}`);
  return ok(parsed.data.id ? "Lesson updated." : "Lesson created.");
}

export async function deleteLessonAction(formData: FormData) {
  const auth = await requireContentManager();
  const id = uuidSchema.parse(formData.get("id")?.toString());
  const supabase = createAdminClient();
  const { error } = await supabase.from("course_lessons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await writeAuditEvent({ actorId: auth.user.id, action: "lesson.delete", target: id });
  revalidatePath("/admin/courses");
}

export async function createPendingEnrollmentAction(courseId: string, batchId?: string, orderId?: string) {
  const { user } = await requireOnboardedUser();
  const parsed = enrollmentMutationSchema.parse({
    userId: user.id,
    courseId,
    batchId: batchId ?? "",
    orderId: orderId ?? "",
    status: "pending",
    activationStatus: "pending"
  });

  const supabase = await createClient();
  const { error } = await supabase.from("enrollments").insert({
    user_id: parsed.userId,
    course_id: parsed.courseId,
    batch_id: parsed.batchId || null,
    order_id: parsed.orderId || null,
    status: "pending",
    activation_status: "pending"
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function recordWatchHeartbeat(input: unknown) {
  const { user } = await requireOnboardedUser();
  const parsed = watchHeartbeatSchema.parse(input);
  const access = await requireLessonAccess(parsed.lessonId);
  const allowed = await userHasLessonAccess(user.id, access.lesson.course_id, access.lesson.batch_id);
  if (!allowed && !access.lesson.is_preview) throw new Error("Lesson access denied.");

  const supabase = await createClient();
  const { error } = await supabase.from("watch_analytics").upsert({
    user_id: user.id,
    course_id: access.lesson.course_id,
    batch_id: access.lesson.batch_id,
    lesson_id: parsed.lessonId,
    last_position_seconds: parsed.positionSeconds,
    duration_seconds: parsed.durationSeconds ?? access.lesson.duration_seconds,
    heartbeat_count: 1,
    completed_at: parsed.isCompleted ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id,lesson_id" });

  if (error) throw new Error(error.message);
  return { ok: true };
}
