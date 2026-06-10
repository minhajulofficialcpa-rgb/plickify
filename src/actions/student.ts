"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOnboardedUser } from "@/lib/auth";
import { hasSupabaseAdminEnv } from "@/lib/lms";
import { assignmentSubmissionSchema, downloadRequestSchema, productCheckoutSchema, supportReplySchema, supportTicketSchema } from "@/lib/validations";

function value(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

function optional(value: string) {
  return value ? value : null;
}

function ensureAdminEnv() {
  if (!hasSupabaseAdminEnv()) throw new Error("Supabase admin environment variables are required.");
  return createAdminClient();
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

function getProductAccess(product: { category: string | null; access_type: string | null; price_bdt: number | null }) {
  if (product.access_type === "free" || product.category === "free" || Number(product.price_bdt ?? 0) === 0) return "free";
  if (product.access_type === "manual" || product.access_type === "subscription" || product.category === "subscription" || product.category === "manual_service") return "manual";
  return "purchase";
}

export async function startProductCheckoutAction(formData: FormData) {
  const { user, profile } = await requireOnboardedUser();
  const input = productCheckoutSchema.parse({ productId: value(formData, "productId") });
  const supabase = ensureAdminEnv();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, title, category, access_type, price_bdt, status")
    .eq("id", input.productId)
    .eq("status", "published")
    .maybeSingle();

  if (productError) throw new Error(productError.message);
  if (!product) throw new Error("Product is not available.");

  const accessType = getProductAccess(product);
  const isFree = accessType === "free";
  const total = isFree ? 0 : Number(product.price_bdt ?? 0);
  const activationStatus = isFree ? "active" : "pending";
  const orderStatus = isFree ? "paid" : "pending";
  const paymentStatus = isFree ? "paid" : "pending";

  const { data: order, error } = await supabase.from("orders").insert({
    user_id: user.id,
    product_id: product.id,
    item_type: "product",
    status: orderStatus,
    payment_status: paymentStatus,
    access_type: accessType,
    activation_status: activationStatus,
    subtotal_bdt: total,
    discount_bdt: 0,
    total_bdt: total,
    customer_email: profile?.email ?? user.email,
    customer_phone: profile?.phone_number,
    metadata: { product_title: product.title, category: product.category }
  }).select("id").single();

  if (error) throw new Error(error.message);

  if (isFree) {
    await supabase.rpc("grant_product_download_access", { p_user_id: user.id, p_product_id: product.id, p_order_id: order.id });
    await createNotification(user.id, "Free product unlocked", product.title, "/dashboard/downloads", "product", product.id);
    revalidatePath("/dashboard/downloads");
    redirect("/dashboard/downloads");
  }

  await createNotification(
    user.id,
    accessType === "manual" ? "Activation request created" : "Order created",
    accessType === "manual" ? "Your product is waiting for manual activation." : "Complete payment to unlock this product.",
    "/dashboard/orders",
    "order",
    order.id
  );
  revalidatePath("/dashboard/orders");
  redirect("/dashboard/orders");
}

export async function createDownloadUrlAction(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const input = downloadRequestSchema.parse({ downloadId: value(formData, "downloadId") });
  const supabase = ensureAdminEnv();

  const { data: download, error } = await supabase
    .from("downloads")
    .select("id, user_id, product_id, order_id, file_path, bucket_name, download_count, max_downloads, expires_at, status, products(title, private_file_path, download_bucket)")
    .eq("id", input.downloadId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!download) throw new Error("Download not found.");
  if (download.status !== "active") throw new Error("This download is not active.");
  if (download.expires_at && new Date(download.expires_at).getTime() < Date.now()) throw new Error("This download has expired.");
  if (download.max_downloads && Number(download.download_count ?? 0) >= Number(download.max_downloads)) throw new Error("Download limit reached.");

  const product = Array.isArray(download.products) ? download.products[0] : download.products;
  const privatePath = download.file_path ?? product?.private_file_path ?? null;
  const bucket = download.bucket_name ?? product?.download_bucket ?? process.env.SUPABASE_DOWNLOADS_BUCKET ?? "downloads";
  if (!privatePath) throw new Error("Private file path is missing.");

  const { data, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(privatePath, 60 * 5);
  if (signedError) throw new Error(signedError.message);

  await supabase.from("downloads").update({
    download_count: Number(download.download_count ?? 0) + 1,
    last_downloaded_at: new Date().toISOString()
  }).eq("id", download.id);

  redirect(data.signedUrl as Parameters<typeof redirect>[0]);
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
