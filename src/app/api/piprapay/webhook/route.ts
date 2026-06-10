import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { writeAuditEvent } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";

const pipraPayWebhookSchema = z.object({
  event_id: z.string().trim().min(1).max(160).optional(),
  order_id: z.string().uuid(),
  transaction_id: z.string().trim().min(3).max(180),
  amount_bdt: z.coerce.number().int().positive(),
  currency: z.string().trim().default("BDT"),
  status: z.enum(["paid", "successful", "success", "failed", "cancelled"]),
  payment_method: z.string().trim().max(120).optional(),
  provider_payment_id: z.string().trim().max(180).optional()
});

type WebhookPayload = z.infer<typeof pipraPayWebhookSchema>;

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

function getSignature(request: NextRequest) {
  return request.headers.get("x-piprapay-signature") ?? request.headers.get("x-signature") ?? "";
}

function isValidSignature(rawBody: string, signature: string, secret: string) {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signature.startsWith("sha256=") ? signature.slice(7) : signature;
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

async function logWebhook(payload: Partial<WebhookPayload> | null, rawPayload: unknown, signatureValid: boolean, processed: boolean, processingError?: string) {
  const supabase = createAdminClient();
  await supabase.from("payment_webhook_logs").insert({
    provider: "piprapay",
    event_id: payload?.event_id ?? null,
    order_id: payload?.order_id ?? null,
    transaction_id: payload?.transaction_id ?? null,
    signature_valid: signatureValid,
    processed,
    processing_error: processingError ?? null,
    raw_payload: typeof rawPayload === "object" && rawPayload !== null ? rawPayload : { raw: String(rawPayload ?? "") }
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.PIPRAPAY_WEBHOOK_SECRET;
  if (!secret) return json(500, { ok: false, error: "Webhook secret is not configured." });

  const rawBody = await request.text();
  const signatureValid = isValidSignature(rawBody, getSignature(request), secret);
  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    await logWebhook(null, rawBody, signatureValid, false, "Invalid JSON payload.");
    return json(400, { ok: false, error: "Invalid JSON payload." });
  }

  const parsed = pipraPayWebhookSchema.safeParse(parsedBody);
  if (!parsed.success) {
    await logWebhook(null, parsedBody, signatureValid, false, "Invalid webhook payload.");
    return json(400, { ok: false, error: "Invalid webhook payload." });
  }

  const payload = parsed.data;
  if (!signatureValid) {
    await logWebhook(payload, parsedBody, false, false, "Invalid webhook signature.");
    return json(401, { ok: false, error: "Invalid webhook signature." });
  }

  const supabase = createAdminClient();
  const { data: existingPayment, error: duplicateLookupError } = await supabase
    .from("payments")
    .select("id")
    .eq("provider", "piprapay")
    .eq("transaction_id", payload.transaction_id)
    .maybeSingle();

  if (duplicateLookupError) {
    await logWebhook(payload, parsedBody, true, false, duplicateLookupError.message);
    return json(500, { ok: false, error: "Could not verify transaction state." });
  }

  if (existingPayment) {
    await logWebhook(payload, parsedBody, true, false, "Duplicate transaction_id.");
    return json(409, { ok: false, error: "Duplicate transaction_id." });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, product_id, course_id, total_bdt, currency, status, payment_status")
    .eq("id", payload.order_id)
    .maybeSingle();

  if (orderError || !order) {
    await logWebhook(payload, parsedBody, true, false, orderError?.message ?? "Order not found.");
    return json(404, { ok: false, error: "Order not found." });
  }

  if (Number(order.total_bdt) !== payload.amount_bdt || String(order.currency ?? "BDT") !== payload.currency) {
    await logWebhook(payload, parsedBody, true, false, "Payment amount or currency mismatch.");
    await writeAuditEvent({ action: "payment.amount_mismatch", targetTable: "orders", targetId: order.id, metadata: { expectedAmount: order.total_bdt, receivedAmount: payload.amount_bdt, expectedCurrency: order.currency, receivedCurrency: payload.currency } });
    return json(422, { ok: false, error: "Payment amount or currency mismatch." });
  }

  const paid = ["paid", "successful", "success"].includes(payload.status);
  const paymentStatus = paid ? "paid" : payload.status === "failed" ? "failed" : "cancelled";
  const orderStatus = paid ? "paid" : payload.status === "failed" ? "failed" : "cancelled";

  const { data: payment, error: paymentError } = await supabase.from("payments").insert({
    order_id: order.id,
    user_id: order.user_id,
    provider: "piprapay",
    provider_payment_id: payload.provider_payment_id ?? null,
    transaction_id: payload.transaction_id,
    status: paymentStatus,
    amount_bdt: payload.amount_bdt,
    currency: payload.currency,
    payment_method: payload.payment_method ?? null,
    raw_payload: parsedBody,
    paid_at: paid ? new Date().toISOString() : null
  }).select("id").single();

  if (paymentError) {
    await logWebhook(payload, parsedBody, true, false, paymentError.message);
    return json(paymentError.code === "23505" ? 409 : 500, { ok: false, error: paymentError.code === "23505" ? "Duplicate transaction_id." : "Payment could not be recorded." });
  }

  const { error: orderUpdateError } = await supabase.from("orders").update({
    status: orderStatus,
    payment_status: paymentStatus,
    activation_status: paid ? "active" : "pending",
    activated_at: paid ? new Date().toISOString() : null
  }).eq("id", order.id);

  if (orderUpdateError) {
    await logWebhook(payload, parsedBody, true, false, orderUpdateError.message);
    return json(500, { ok: false, error: "Order could not be updated." });
  }

  await logWebhook(payload, parsedBody, true, true);
  await writeAuditEvent({ action: paid ? "payment.successful" : "payment.failed", targetTable: "payments", targetId: payment.id, metadata: { orderId: order.id, transactionId: payload.transaction_id, amountBdt: payload.amount_bdt } });

  return json(200, { ok: true });
}
