import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseAdminEnv } from "@/lib/lms";

export type NotificationEventType =
  | "onboarding_complete"
  | "order_submitted"
  | "payment_successful"
  | "access_approved"
  | "assignment_submitted"
  | "assignment_reviewed"
  | "ticket_replied"
  | "certificate_issued"
  | "download_generated";

export interface AppNotification {
  id: string;
  title: string;
  body: string | null;
  status: string;
  action_url: string | null;
  event_type: NotificationEventType | null;
  related_type: string | null;
  related_id: string | null;
  created_at: string;
  read_at: string | null;
}

export interface CreateNotificationInput {
  userId: string;
  title: string;
  body?: string | null;
  actionUrl?: string | null;
  eventType?: NotificationEventType | null;
  relatedType?: string | null;
  relatedId?: string | null;
  metadata?: Record<string, unknown>;
}

function relatedUuid(value: string | null | undefined) {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

export async function createNotification(input: CreateNotificationInput) {
  if (!hasSupabaseAdminEnv()) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("create_app_notification", {
    p_user_id: input.userId,
    p_title: input.title,
    p_body: input.body ?? null,
    p_action_url: input.actionUrl ?? null,
    p_event_type: input.eventType ?? null,
    p_related_type: input.relatedType ?? null,
    p_related_id: relatedUuid(input.relatedId),
    p_metadata: input.metadata ?? {}
  });

  if (error) {
    console.warn(error.message);
    return null;
  }

  return typeof data === "string" ? data : null;
}

export async function getCurrentUserNotifications(limit = 10): Promise<AppNotification[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, status, action_url, event_type, related_type, related_id, created_at, read_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn(error.message);
    return [];
  }

  return (data ?? []) as AppNotification[];
}

export async function getUnreadNotificationCount() {
  const notifications = await getCurrentUserNotifications(20);
  return notifications.filter((notification) => notification.status === "unread").length;
}
