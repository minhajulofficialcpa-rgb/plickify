import { NextResponse } from "next/server";
import { createPipraPayCheckout } from "@/lib/payments/piprapay";
import { checkoutSchema } from "@/lib/validations/checkout";

export async function POST(request: Request) {
  const body = await request.json();
  const payload = checkoutSchema.parse(body);
  const charge = await createPipraPayCheckout(payload);

  return NextResponse.json(charge, { status: 201 });
}
