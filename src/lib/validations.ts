import { z } from "zod";

export const emailSchema = z.string().trim().email();
export const phoneNumberSchema = z.string().trim().min(8).max(20);
export const uuidSchema = z.string().uuid();
const optionalUrlSchema = z.string().trim().url().optional().or(z.literal(""));

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
  thumbnailUrl: optionalUrlSchema,
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
  videoUrl: optionalUrlSchema,
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

export const assignmentMutationSchema = z.object({
  id: uuidSchema.optional().or(z.literal("")),
  courseId: uuidSchema,
  batchId: uuidSchema,
  title: z.string().trim().min(3).max(180),
  instructions: z.string().trim().max(20000).optional(),
  deadline: z.string().trim().optional(),
  maxMarks: z.coerce.number().min(1).max(100000),
  attachmentUrl: optionalUrlSchema,
  status: z.enum(["draft", "published", "archived"])
});

export const assignmentSubmissionSchema = z.object({
  assignmentId: uuidSchema,
  submissionText: z.string().trim().max(20000).optional(),
  submissionUrl: optionalUrlSchema,
  githubUrl: optionalUrlSchema,
  attachmentUrl: optionalUrlSchema
}).refine((value) => Boolean(value.submissionText || value.submissionUrl || value.githubUrl || value.attachmentUrl), {
  message: "Submit text, a URL, a GitHub link, or a file URL."
});

export const assignmentReviewSchema = z.object({
  id: uuidSchema,
  status: z.enum(["submitted", "graded", "returned", "late"]),
  marks: z.coerce.number().min(0).optional(),
  feedback: z.string().trim().max(10000).optional()
});

export const supportTicketSchema = z.object({
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(5).max(10000),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  category: z.string().trim().max(80).default("student_support"),
  attachmentUrl: optionalUrlSchema
});

export const supportReplySchema = z.object({
  ticketId: uuidSchema,
  message: z.string().trim().min(2).max(10000),
  attachmentUrl: optionalUrlSchema
});

export const supportTicketStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(["open", "pending", "resolved", "closed"]),
  priority: z.enum(["low", "normal", "high", "urgent"])
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
export type AssignmentMutationInput = z.infer<typeof assignmentMutationSchema>;
export type AssignmentSubmissionInput = z.infer<typeof assignmentSubmissionSchema>;
export type AssignmentReviewInput = z.infer<typeof assignmentReviewSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type SupportReplyInput = z.infer<typeof supportReplySchema>;
export type SupportTicketStatusInput = z.infer<typeof supportTicketStatusSchema>;
export type WatchHeartbeatInput = z.infer<typeof watchHeartbeatSchema>;
