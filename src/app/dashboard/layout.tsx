import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireOnboardedUser } from "@/lib/auth";
import { getCurrentUserNotifications } from "@/lib/notifications";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireOnboardedUser();
  const notifications = await getCurrentUserNotifications(12);

  return <DashboardShell notifications={notifications}>{children}</DashboardShell>;
}
