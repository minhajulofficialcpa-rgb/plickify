import { replySupportTicketAsStaffAction, updateTicketStatusAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, AdminSection, AdminTable, Field, HiddenId, Select, StatusBadge, Textarea } from "@/components/admin/admin-resource-page";
import { firstAdminRelation, getAdminTickets } from "@/lib/admin-dashboard";

export default async function AdminTicketsPage() {
  const tickets = await getAdminTickets();
  return (
    <div>
      <AdminPageHeader eyebrow="Support" title="Support tickets" description="Reply to students, resolve support tickets, and handle profile change requests." />
      <div className="mt-8">
        <AdminSection title="Tickets">
          <AdminTable rows={tickets} emptyLabel="No support tickets found." columns={[
            { header: "Ticket", cell: (row) => <div><p className="font-bold text-white">{row.subject}</p><p>{row.category ?? "support"}</p><p className="mt-1 max-w-xs text-xs">{row.message}</p></div> },
            { header: "User", cell: (row) => firstAdminRelation(row.profiles)?.email ?? row.user_id ?? "-" },
            { header: "Priority", cell: (row) => row.priority ?? "normal" },
            { header: "Status", cell: (row) => <StatusBadge value={row.status} /> },
            { header: "Thread", cell: (row) => <div className="grid max-w-sm gap-2">{(row.support_messages ?? []).map((message) => <div key={message.id} className="rounded-[0.75rem] border border-white/10 bg-white/[0.04] p-2"><p className="text-xs font-bold text-white">{message.sender_role ?? "student"}</p><p className="whitespace-pre-wrap text-xs text-muted-foreground">{message.message}</p>{message.attachment_url ? <a href={message.attachment_url} className="text-xs text-accent">Attachment</a> : null}</div>)}</div> },
            { header: "Action", cell: (row) => <div className="grid min-w-56 gap-3"><form action={updateTicketStatusAction} className="grid gap-2"><HiddenId id={row.id} /><Select label="Status" name="status" options={["open", "pending", "resolved", "closed"]} /><Select label="Priority" name="priority" options={["low", "normal", "high", "urgent"]} /><Button type="submit" size="sm" variant="accent">Update</Button></form><form action={replySupportTicketAsStaffAction} className="grid gap-2"><input type="hidden" name="ticketId" value={row.id} /><Textarea label="Reply" name="message" /><Field label="Attachment URL" name="attachmentUrl" type="url" required={false} /><Button type="submit" size="sm" variant="secondary">Reply</Button></form></div> }
          ]} />
        </AdminSection>
      </div>
    </div>
  );
}
