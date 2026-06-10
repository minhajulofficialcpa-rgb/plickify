import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/lms";

export interface AuditEvent {
  actorId?: string;
  action: string;
  target?: string;
  targetTable?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export async function writeAuditEvent(event: AuditEvent) {
  const createdAt = new Date().toISOString();
  const payload = {
    actor_id: event.actorId ?? null,
    action: event.action,
    target_table: event.targetTable ?? null,
    target_id: event.targetId ?? event.target ?? null,
    metadata: event.metadata ?? {},
    created_at: createdAt
  };

  if (!hasSupabaseAdminEnv()) {
    return { ...event, createdAt };
  }

  const { error } = await createAdminClient().from("audit_logs").insert(payload);
  if (error) {
    console.warn(error.message);
    return { ...event, createdAt, auditError: error.message };
  }

  return { ...event, createdAt };
}
