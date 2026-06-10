import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Lock, Mail, Phone, User } from "lucide-react";
import { openProfileChangeTicketAction } from "@/actions/student";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireOnboardedUser } from "@/lib/auth";

const textareaClass = "min-h-28 w-full rounded-[1rem] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10";

export default async function DashboardProfilePage() {
  const { user, profile } = await requireOnboardedUser();

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Profile</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Locked profile</h1>
      <p className="mt-3 text-muted-foreground">Email and phone are locked after onboarding and cannot be edited directly by normal users.</p>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader><Lock className="h-6 w-6 text-accent" /><CardTitle>{profile?.full_name ?? user.email ?? "Student"}</CardTitle><CardDescription>{profile?.is_locked ? "Profile locked" : "Profile not locked yet"}</CardDescription></CardHeader>
          <div className="grid gap-4 px-6 pb-6">
            <Info icon={User} label="Full name" value={profile?.full_name ?? "Not set"} />
            <Info icon={Mail} label="Email" value={profile?.email ?? user.email ?? "Not set"} />
            <Info icon={Phone} label="Phone" value={profile?.phone_number ?? "Not set"} />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Request profile change</CardTitle><CardDescription>Open a support ticket for email, phone, or identity corrections.</CardDescription></CardHeader>
          <form action={openProfileChangeTicketAction} className="grid gap-4 px-6 pb-6">
            <div className="grid gap-2"><Label htmlFor="requestedChange">Requested change</Label><Input id="requestedChange" name="requestedChange" placeholder="Update phone number" /></div>
            <div className="grid gap-2"><Label htmlFor="message">Details</Label><textarea id="message" name="message" className={textareaClass} /></div>
            <Button type="submit" variant="accent">Open support ticket</Button>
            <Button asChild variant="secondary"><Link href="/dashboard/support">View support</Link></Button>
          </form>
        </Card>
      </section>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] p-4"><Icon className="h-4 w-4 text-accent" /><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p><p className="font-semibold text-white">{value}</p></div></div>;
}
