import crypto from "node:crypto";
import { checkoutSchema, type CheckoutPayload } from "@/lib/validations/checkout";

const PIPRAPAY_BASE_URL = process.env.PIPRAPAY_BASE_URL ?? "https://pay.piprapay.com";

export interface PipraPayCheckoutResponse {
  payment_id: string;
  payment_url: string;
  status: "pending" | "paid" | "failed";
}

export async function createPipraPayCheckout(payload: CheckoutPayload): Promise<PipraPayCheckoutResponse> {
  const parsed = checkoutSchema.parse(payload);
  const response = await fetch(`${PIPRAPAY_BASE_URL}/api/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.PIPRAPAY_API_KEY ?? ""
    },
    body: JSON.stringify({
      amount: parsed.amount,
      currency: "BDT",
      method: parsed.paymentMethod,
      customer: {
        name: parsed.customerName,
        email: parsed.customerEmail,
        phone: parsed.customerPhone
      },
      metadata: {
        item_id: parsed.itemId,
        item_type: parsed.itemType
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`
    })
  });

  if (!response.ok) {
    throw new Error(`PipraPay checkout failed: ${response.status}`);
  }

  return response.json();
}

export function verifyPipraPaySignature(rawBody: string, signature: string | null) {
  if (!signature || !process.env.PIPRAPAY_WEBHOOK_SECRET) return false;

  const expected = crypto
    .createHmac("sha256", process.env.PIPRAPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
