import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPipraPaySignature } from "@/lib/payments/piprapay";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-piprapay-signature");

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
