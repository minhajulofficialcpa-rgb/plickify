"use server";

import { profileSchema } from "@/lib/validations";
import { writeAuditEvent } from "@/lib/audit";

export async function completeProfileAction(formData: FormData) {
  const payload = profileSchema.parse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role") || "student"
  });

  await writeAuditEvent({ action: "profile.completed", metadata: payload });

  return { ok: true };
}
