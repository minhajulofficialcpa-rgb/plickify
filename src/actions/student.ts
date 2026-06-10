"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";

export async function openProfileChangeTicketAction(formData: FormData) {
  const { user, profile } = await requireOnboardedUser();
  const requestedChange = formData.get("requestedChange")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  const supabase = await createClient();
  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    subject: "Profile change request",
    status: "open",
    priority: "normal",
    category: "profile_change",
    message: [
      `Locked profile: ${profile?.full_name ?? user.email ?? user.id}`,
      requestedChange ? `Requested change: ${requestedChange}` : null,
      message ? `Message: ${message}` : null
    ].filter(Boolean).join("\n")
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/support");
}

export async function openSupportTicketAction(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!subject || subject.length < 3) throw new Error("Support subject is required.");

  const supabase = await createClient();
  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    subject,
    status: "open",
    priority: "normal",
    category: "student_support",
    message: message || null
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/support");
}
