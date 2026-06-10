import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/lms";
import type { GaEventName } from "@/lib/analytics";

export interface ServerAnalyticsEvent {
  userId?: string | null;
  eventName: GaEventName | string;
  path?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function writeServerAnalyticsEvent(event: ServerAnalyticsEvent) {
  if (!hasSupabaseAdminEnv()) return null;

  const { data, error } = await createAdminClient().rpc("write_analytics_event", {
    p_user_id: event.userId ?? null,
    p_event_name: event.eventName,
    p_source: "server",
    p_path: event.path ?? null,
    p_entity_type: event.entityType ?? null,
    p_entity_id: event.entityId ?? null,
    p_metadata: event.metadata ?? {}
  });

  if (error) {
    console.warn(error.message);
    return null;
  }

  return typeof data === "string" ? data : null;
}
