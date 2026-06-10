import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const metaEventSchema = z.object({
  eventName: z.enum(["ViewContent", "Lead", "CompleteRegistration", "InitiateCheckout", "Purchase", "Contact", "Subscribe"]),
  eventId: z.string().min(1),
  eventSourceUrl: z.string().url().optional(),
  customData: z.record(z.string(), z.unknown()).optional(),
  userData: z.record(z.string(), z.unknown()).optional()
});

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? undefined;
}

export async function POST(request: NextRequest) {
  const pixelId = process.env.META_PIXEL_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return NextResponse.json({ ok: false, skipped: true, reason: "Meta CAPI is not configured." }, { status: 202 });
  }

  const payload = metaEventSchema.parse(await request.json());
  const body = {
    data: [
      {
        event_name: payload.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: payload.eventId,
        action_source: "website",
        event_source_url: payload.eventSourceUrl,
        user_data: {
          client_ip_address: clientIp(request),
          client_user_agent: request.headers.get("user-agent") ?? undefined,
          ...payload.userData
        },
        custom_data: payload.customData ?? {}
      }
    ]
  };

  const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json({ ok: false, data }, { status: 502 });
  }

  return NextResponse.json({ ok: true, data });
}
