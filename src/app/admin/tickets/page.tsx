import { resolveTicketAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, AdminSection, AdminTable, HiddenId, Select, StatusBadge } from "@/components/admin/admin-resource-page";
import { firstAdminRelation, getAdminTickets } from "@/lib/admin-dashboard";

export default async function AdminTicketsPage() {
  const tickets = await getAdminTickets();
  return <div><AdminPageHeader eyebrow="Support" title="Support tickets" description="Resolve support tickets and profile change requests." /><div className="mt-8"><AdminSection title="Tickets"><AdminTable rows={tickets} emptyLabel="No support tickets found." columns={[{ header: "Ticket", cell: (row) => <div><p className="font-bold text-white">{row.subject}</p><p>{row.category ?? "support"}</p></div> }, { header: "User", cell: (row) => firstAdminRelation(row.profiles)?.email ?? row.user_id ?? "-" }, { header: "Priority", cell: (row) => row.priority ?? "normal" }, { header: "Status", cell: (row) => <StatusBadge value={row.status} /> }, { header: "Action", cell: (row) => <form action={resolveTicketAction} className="grid gap-2"><HiddenId id={row.id} /><Select label="Status" name="status" options={["open", "pending", "resolved", "closed"]} /><Button type="submit" size="sm" variant="accent">Update</Button></form> }]} /></AdminSection></div></div>;
}
