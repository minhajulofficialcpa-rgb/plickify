"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";

function idValue(formData: FormData) {
  return formData.get("id")?.toString().trim() ?? "";
}

export async function markNotificationReadAction(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const id = idValue(formData);
  if (!id) throw new Error("Notification id is required.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction() {
  const { user } = await requireOnboardedUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("status", "unread");

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
