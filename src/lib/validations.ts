import { z } from "zod";

export const emailSchema = z.string().trim().email();
export const phoneNumberSchema = z.string().trim().min(8).max(20);
export const uuidSchema = z.string().uuid();

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: emailSchema,
  phoneNumber: phoneNumberSchema
});

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  subject: z.string().trim().max(160).optional(),
  message: z.string().trim().min(10).max(5000)
});

export const courseMutationSchema = z.object({
  id: uuidSchema.optional(),
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(5000).optional(),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal("")),
  priceBdt: z.coerce.number().int().min(0),
  status: z.enum(["draft", "published", "archived"]),
  isFeatured: z.coerce.boolean().optional()
});

export const batchMutationSchema = z.object({
  id: uuidSchema.optional(),
  courseId: uuidSchema,
  title: z.string().trim().min(3).max(180),
  status: z.enum(["draft", "enrolling", "active", "completed", "archived"]),
  startsAt: z.string().trim().optional(),
  endsAt: z.string().trim().optional(),
  capacity: z.coerce.number().int().min(0).optional()
});

export const lessonMutationSchema = z.object({
  id: uuidSchema.optional(),
  courseId: uuidSchema,
  batchId: uuidSchema.optional().or(z.literal("")),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(5000).optional(),
  content: z.string().trim().max(20000).optional(),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
  youtubeVideoId: z.string().trim().max(32).optional(),
  position: z.coerce.number().int().min(1),
  durationSeconds: z.coerce.number().int().min(0),
  status: z.enum(["draft", "published", "archived"]),
  isPreview: z.coerce.boolean().optional(),
  isLocked: z.coerce.boolean().optional()
});

export const enrollmentMutationSchema = z.object({
  userId: uuidSchema,
  courseId: uuidSchema,
  batchId: uuidSchema.optional().or(z.literal("")),
  orderId: uuidSchema.optional().or(z.literal("")),
  status: z.enum(["pending", "active", "cancelled", "completed", "expired"]),
  activationStatus: z.enum(["pending", "active", "inactive", "revoked"]).default("pending")
});

export const watchHeartbeatSchema = z.object({
  lessonId: uuidSchema,
  positionSeconds: z.coerce.number().int().min(0),
  durationSeconds: z.coerce.number().int().min(0).optional(),
  isCompleted: z.coerce.boolean().optional()
});

export const profileSchema = onboardingSchema;

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type CourseMutationInput = z.infer<typeof courseMutationSchema>;
export type BatchMutationInput = z.infer<typeof batchMutationSchema>;
export type LessonMutationInput = z.infer<typeof lessonMutationSchema>;
export type EnrollmentMutationInput = z.infer<typeof enrollmentMutationSchema>;
export type WatchHeartbeatInput = z.infer<typeof watchHeartbeatSchema>;
