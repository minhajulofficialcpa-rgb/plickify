import { z } from "zod";

export const emailSchema = z.string().trim().email();
export const phoneNumberSchema = z.string().trim().min(8).max(20);

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

export const profileSchema = onboardingSchema;

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
