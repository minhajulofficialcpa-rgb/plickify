import { HelpCircle, MessageSquarePlus } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function StudentSupportPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <Badge>Phase 8 · Support ticket system</Badge>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.06em]">Get help without leaving your course workspace.</h1>
          <p className="mt-5 text-muted-foreground">Tickets are RLS-protected so students only see their own conversations while support admins can triage by SLA.</p>
        </div>
        <Card>
          <CardHeader>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent"><HelpCircle className="h-6 w-6" /></div>
            <CardTitle>Open a support ticket</CardTitle>
            <CardDescription>Use a Server Action and Zod validation when connecting this form to Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input placeholder="Subject" />
            <Input placeholder="Course or invoice number" />
            <Button variant="accent"><MessageSquarePlus className="h-4 w-4" /> Create ticket</Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
