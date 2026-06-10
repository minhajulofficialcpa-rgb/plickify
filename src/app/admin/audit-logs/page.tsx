import { requireSuperAdmin } from "@/lib/auth";
import { AdminPageHeader, AdminSection, AdminTable } from "@/components/admin/admin-resource-page";
import { getAdminAuditLogs } from "@/lib/admin-dashboard";

export default async function AdminAuditLogsPage() {
  await requireSuperAdmin();
  const logs = await getAdminAuditLogs();
  return <div><AdminPageHeader eyebrow="Super admin" title="Audit logs" description="Read-only trail of sensitive admin actions." /><div className="mt-8"><AdminSection title="Audit events"><AdminTable rows={logs} emptyLabel="No audit logs found." columns={[{ header: "Action", cell: (row) => <p className="font-bold text-white">{row.action}</p> }, { header: "Actor", cell: (row) => row.actor_id ?? "system" }, { header: "Target", cell: (row) => `${row.target_table ?? "unknown"}:${row.target_id ?? "-"}` }, { header: "Created", cell: (row) => new Date(row.created_at).toLocaleString("en-BD") }]} /></AdminSection></div></div>;
}
