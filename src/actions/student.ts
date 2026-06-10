"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { assignmentSubmissionSchema, supportReplySchema, supportTicketSchema } from "@/lib/validations";

function value(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

function optional(value: string) {
  return value ? value : null;
}

async function createNotification(userId: string, title: string, body: string, actionUrl: string, relatedType: string, relatedId: string) {
  const supabase = await createClient();
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    body,
    action_url: actionUrl,
    related_type: relatedType,
    related_id: relatedId
  });
}

export async function submitAssignmentAction(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const input = assignmentSubmissionSchema.parse({
    assignmentId: value(formData, "assignmentId"),
    submissionText: value(formData, "submissionText"),
    submissionUrl: value(formData, "submissionUrl"),
    githubUrl: value(formData, "githubUrl"),
    attachmentUrl: value(formData, "attachmentUrl")
  });

  const supabase = await createClient();
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, title, status")
    .eq("id", input.assignmentId)
    .eq("status", "published")
    .maybeSingle();

  if (assignmentError) throw new Error(assignmentError.message);
  if (!assignment) throw new Error("Assignment is not available for your batch.");

  const payload = {
    assignment_id: input.assignmentId,
    user_id: user.id,
    content: optional(input.submissionText ?? ""),
    file_url: optional(input.attachmentUrl ?? ""),
    submission_text: optional(input.submissionText ?? ""),
    submission_url: optional(input.submissionUrl ?? ""),
    github_url: optional(input.githubUrl ?? ""),
    attachment_url: optional(input.attachmentUrl ?? ""),
    status: "submitted",
    submitted_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("assignment_submissions")
    .upsert(payload, { onConflict: "assignment_id,user_id" });

  if (error) throw new Error(error.message);
  await createNotification(user.id, "Assignment submitted", assignment.title, "/dashboard/assignments", "assignment", input.assignmentId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/assignments");
}

export async function openProfileChangeTicketAction(formData: FormData) {
  const { user, profile } = await requireOnboardedUser();
  const requestedChange = value(formData, "requestedChange");
  const message = value(formData, "message");

  const mergedMessage = [
    `Locked profile: ${profile?.full_name ?? user.email ?? user.id}`,
    requestedChange ? `Requested change: ${requestedChange}` : null,
    message ? `Message: ${message}` : null
  ].filter(Boolean).join("\n");

  const supabase = await createClient();
  const { data, error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    subject: "Profile change request",
    status: "open",
    priority: "normal",
    category: "profile_change",
    message: mergedMessage
  }).select("id").single();

  if (error) throw new Error(error.message);

  const ticketId = data.id as string;
  const { error: messageError } = await supabase.from("support_messages").insert({
    ticket_id: ticketId,
    sender_id: user.id,
    sender_role: "student",
    message: mergedMessage
  });
  if (messageError) throw new Error(messageError.message);

  await createNotification(user.id, "Profile change ticket opened", "Support will review your locked profile change request.", "/dashboard/support", "support_ticket", ticketId);
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/support");
}

export async function openSupportTicketAction(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const input = supportTicketSchema.parse({
    subject: value(formData, "subject"),
    message: value(formData, "message"),
    priority: value(formData, "priority") || "normal",
    category: value(formData, "category") || "student_support",
    attachmentUrl: value(formData, "attachmentUrl")
  });

  const supabase = await createClient();
  const { data, error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    subject: input.subject,
    status: "open",
    priority: input.priority,
    category: input.category,
    message: input.message
  }).select("id").single();

  if (error) throw new Error(error.message);

  const ticketId = data.id as string;
  const { error: messageError } = await supabase.from("support_messages").insert({
    ticket_id: ticketId,
    sender_id: user.id,
    sender_role: "student",
    message: input.message,
    attachment_url: optional(input.attachmentUrl ?? "")
  });
  if (messageError) throw new Error(messageError.message);

  await createNotification(user.id, "Support ticket opened", input.subject, "/dashboard/support", "support_ticket", ticketId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/support");
}

export async function replySupportTicketAction(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const input = supportReplySchema.parse({
    ticketId: value(formData, "ticketId"),
    message: value(formData, "message"),
    attachmentUrl: value(formData, "attachmentUrl")
  });

  const supabase = await createClient();
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .select("id, status")
    .eq("id", input.ticketId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (ticketError) throw new Error(ticketError.message);
  if (!ticket) throw new Error("Ticket not found.");
  if (["resolved", "closed"].includes(String(ticket.status))) throw new Error("This ticket is already closed.");

  const { error } = await supabase.from("support_messages").insert({
    ticket_id: input.ticketId,
    sender_id: user.id,
    sender_role: "student",
    message: input.message,
    attachment_url: optional(input.attachmentUrl ?? "")
  });

  if (error) throw new Error(error.message);
  await createNotification(user.id, "Support reply sent", "Your reply was added to the ticket.", "/dashboard/support", "support_ticket", input.ticketId);
  revalidatePath("/dashboard/support");
}
