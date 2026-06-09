import { z } from "zod";

export const emailSchema = z.string().email();

export const profileSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(8).max(20).optional(),
  role: z.enum(["student", "instructor", "support", "admin"]).default("student")
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(8)
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
