import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPipraPaySignature, type PipraPayWebhookEvent } from "@/lib/payments/piprapay";

const webhookSchema = z.object({
  payment_id: z.string().min(1),
  transaction_id: z.string().min(1),
  invoice_id: z.string().uuid(),
  status: z.enum(["pending", "paid", "failed", "refunded"]),
  amount: z.number().positive(),
  currency: z.literal("BDT"),
  metadata: z.object({
    item_id: z.string().uuid().optional(),
    item_type: z.enum(["course", "product"]).optional(),
    user_id: z.string().uuid().optional()
  }).optional()
});

import { createClient } from "@/lib/supabase/server";
import { verifyPipraPaySignature } from "@/lib/payments/piprapay";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-piprapay-signature");
  const supabase = createAdminClient();

  if (!verifyPipraPaySignature(rawBody, signature)) {
    await supabase.from("payment_webhook_events").insert({
      provider: "piprapay",
      signature_valid: false,
      raw_payload: safeJson(rawBody)
    });

    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = webhookSchema.parse(JSON.parse(rawBody)) satisfies PipraPayWebhookEvent;

  const { error: logError } = await supabase.from("payment_webhook_events").insert({
    provider: "piprapay",
    provider_payment_id: event.payment_id,
    transaction_id: event.transaction_id,
    signature_valid: true,
    raw_payload: event
  });

  if (logError?.code === "23505") {
    return NextResponse.json({ error: "Duplicate transaction" }, { status: 409 });
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, amount_bdt, status, user_id")
    .eq("id", event.invoice_id)
    .single();

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (Number(invoice.amount_bdt) !== event.amount) {
    await supabase.from("payments").insert({
      invoice_id: event.invoice_id,
      provider: "piprapay",
      provider_payment_id: event.payment_id,
      transaction_id: event.transaction_id,
      status: "failed",
      raw_payload: { ...event, rejection_reason: "amount_mismatch" }
    });

    return NextResponse.json({ error: "Amount mismatch" }, { status: 422 });
  }

  if (invoice.status === "paid") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await supabase.from("payments").upsert({
    invoice_id: event.invoice_id,
    provider: "piprapay",
    provider_payment_id: event.payment_id,
    transaction_id: event.transaction_id,
    status: event.status,
    raw_payload: event
  }, { onConflict: "provider_payment_id" });

  if (event.status !== "paid") {
    return NextResponse.json({ received: true, access_granted: false });
  }

  await supabase.from("invoices").update({ status: "paid" }).eq("id", event.invoice_id);

  if (event.metadata?.item_type === "course" && event.metadata.item_id) {
    await supabase.from("enrollments").upsert({
      user_id: event.metadata.user_id ?? invoice.user_id,
      course_id: event.metadata.item_id
    }, { onConflict: "user_id,course_id" });
  }

  return NextResponse.json({ received: true, access_granted: true });
}

function safeJson(rawBody: string) {
  try {
    return JSON.parse(rawBody);
  } catch {
    return { rawBody };
  }
  if (!verifyPipraPaySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    payment_id: string;
    status: "pending" | "paid" | "failed" | "refunded";
    invoice_id?: string;
    metadata?: Record<string, string>;
  };

  const supabase = await createClient();
  await supabase.from("payments").upsert({
    provider_payment_id: event.payment_id,
    status: event.status,
    raw_payload: event,
    invoice_id: event.invoice_id ?? null
  }, { onConflict: "provider_payment_id" });

  if (event.status === "paid" && event.invoice_id) {
    await supabase.from("invoices").update({ status: "paid" }).eq("id", event.invoice_id);
  }

  return NextResponse.json({ received: true });
}
