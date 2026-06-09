import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireOnboardedUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireOnboardedUser();

  return <DashboardShell>{children}</DashboardShell>;
}
