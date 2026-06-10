import { NextResponse } from "next/server";
import { recordWatchHeartbeat } from "@/actions/lms";

export async function POST(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    await recordWatchHeartbeat({
      ...body,
      lessonId
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record heartbeat.";
    return NextResponse.json({ ok: false, message }, { status: 403 });
  }
}
