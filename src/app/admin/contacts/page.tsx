import { updateContactStatusAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, AdminSection, AdminTable, HiddenId, Select, StatusBadge } from "@/components/admin/admin-resource-page";
import { getAdminContacts } from "@/lib/admin-dashboard";

export default async function AdminContactsPage() {
  const contacts = await getAdminContacts();
  return <div><AdminPageHeader eyebrow="Inbox" title="Contact messages" description="Review public contact submissions and mark follow-up status." /><div className="mt-8"><AdminSection title="Messages"><AdminTable rows={contacts} emptyLabel="No contact messages found." columns={[{ header: "Sender", cell: (row) => <div><p className="font-bold text-white">{row.full_name ?? "Visitor"}</p><p>{row.email ?? "No email"}</p></div> }, { header: "Subject", cell: (row) => row.subject ?? "General" }, { header: "Status", cell: (row) => <StatusBadge value={row.status} /> }, { header: "Created", cell: (row) => new Date(row.created_at).toLocaleString("en-BD") }, { header: "Action", cell: (row) => <form action={updateContactStatusAction} className="grid gap-2"><HiddenId id={row.id} /><Select label="Status" name="status" options={["new", "reviewed", "closed"]} /><Button type="submit" size="sm" variant="accent">Update</Button></form> }]} /></AdminSection></div></div>;
}
