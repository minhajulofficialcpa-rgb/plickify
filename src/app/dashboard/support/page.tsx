import { HelpCircle, MessageSquareReply } from "lucide-react";
import { openSupportTicketAction, replySupportTicketAction } from "@/actions/student";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireOnboardedUser } from "@/lib/auth";
import { getStudentSupportTickets } from "@/lib/student-dashboard";
import { formatDate } from "@/lib/public-data";

const textareaClass = "min-h-28 w-full rounded-[1rem] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10";
const selectClass = "h-11 rounded-[1rem] border border-white/10 bg-white/10 px-4 text-sm text-white outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";

export default async function DashboardSupportPage() {
  const { user } = await requireOnboardedUser();
  const tickets = await getStudentSupportTickets(user.id);

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Support</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Support tickets</h1>
      <p className="mt-3 text-muted-foreground">Ask for help with courses, orders, downloads, or locked profile changes.</p>

      <section className="mt-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader><CardTitle>Open ticket</CardTitle><CardDescription>Support requests are saved securely on the server.</CardDescription></CardHeader>
          <form action={openSupportTicketAction} className="grid gap-4 px-6 pb-6">
            <div className="grid gap-2"><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" required /></div>
            <div className="grid gap-2"><Label htmlFor="category">Category</Label><Input id="category" name="category" defaultValue="student_support" /></div>
            <div className="grid gap-2"><Label htmlFor="priority">Priority</Label><select id="priority" name="priority" className={selectClass} defaultValue="normal"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div className="grid gap-2"><Label htmlFor="message">Message</Label><textarea id="message" name="message" className={textareaClass} required /></div>
            <div className="grid gap-2"><Label htmlFor="attachmentUrl">Attachment URL</Label><Input id="attachmentUrl" name="attachmentUrl" type="url" /></div>
            <Button type="submit" variant="accent">Submit</Button>
          </form>
        </Card>

        <Card>
          <CardHeader><CardTitle>My tickets</CardTitle><CardDescription>Newest support requests first.</CardDescription></CardHeader>
          <div className="grid gap-4 p-6 pt-0">
            {tickets.length ? tickets.map((ticket) => {
              const isClosed = ticket.status === "resolved" || ticket.status === "closed";
              return (
                <div key={ticket.id} className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white"><HelpCircle className="h-4 w-4 text-accent" /> {ticket.subject}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{ticket.status} - {ticket.priority ?? "normal"} - {ticket.category ?? "support"} - {formatDate(ticket.created_at)}</p>
                  <div className="mt-4 grid gap-3">
                    {(ticket.support_messages ?? []).map((message) => (
                      <div key={message.id} className="rounded-[0.85rem] border border-white/10 bg-background/40 p-3 text-sm">
                        <p className="font-bold text-white">{message.sender_role === "student" ? "You" : "Support"}</p>
                        <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{message.message}</p>
                        {message.attachment_url ? <a href={message.attachment_url} className="mt-2 inline-flex text-xs font-semibold text-accent">Open attachment</a> : null}
                      </div>
                    ))}
                  </div>
                  {!isClosed ? (
                    <form action={replySupportTicketAction} className="mt-4 grid gap-3">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <div className="grid gap-2"><Label htmlFor={`reply-${ticket.id}`}>Reply</Label><textarea id={`reply-${ticket.id}`} name="message" className={textareaClass} required /></div>
                      <div className="grid gap-2"><Label htmlFor={`replyAttachment-${ticket.id}`}>Attachment URL</Label><Input id={`replyAttachment-${ticket.id}`} name="attachmentUrl" type="url" /></div>
                      <Button type="submit" size="sm" variant="secondary"><MessageSquareReply className="h-4 w-4" /> Reply</Button>
                    </form>
                  ) : null}
                </div>
              );
            }) : <Empty label="No support tickets yet." />}
          </div>
        </Card>
      </section>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">{label}</div>;
}
