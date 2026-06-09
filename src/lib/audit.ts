import "server-only";

export interface AuditEvent {
  actorId?: string;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
}

export async function writeAuditEvent(event: AuditEvent) {
  // Placeholder for the audit-log persistence layer. Keep this server-only.
  return {
    ...event,
    createdAt: new Date().toISOString()
  };
}
