import { CalendarClock, FileCheck2 } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const assignments = [
  { title: "Launch funnel outline", course: "Digital Product Studio", due: "June 14, 2026", status: "Pending" },
  { title: "Client proposal draft", course: "Freelance Launchpad", due: "June 18, 2026", status: "Submitted" },
  { title: "AI workflow teardown", course: "AI Productivity Masterclass", due: "June 22, 2026", status: "Needs revision" }
];

export default function StudentAssignmentsPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Badge>Phase 8 · Assignment system</Badge>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.06em]">Assignments and feedback.</h1>
        <section className="mt-10 grid gap-4">
          {assignments.map((assignment) => (
            <Card key={assignment.title}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent"><FileCheck2 className="h-6 w-6" /></div>
                  <div><p className="font-bold">{assignment.title}</p><p className="text-sm text-muted-foreground">{assignment.course}</p></div>
                </div>
                <div className="text-sm text-muted-foreground"><CalendarClock className="mr-2 inline h-4 w-4 text-accent" />{assignment.due} · {assignment.status}</div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
}
