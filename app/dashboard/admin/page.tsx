import { Activity, AlertTriangle, FileText } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { adminStats, auditEvents, courses } from "@/lib/data";

export default function AdminDashboardPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge>Admin dashboard</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Operate the whole LMS.</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Monitor revenue, students, batches, lessons, assignments, certificates, invoices, support, analytics, and audit trails.</p>
          </div>
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            <AlertTriangle className="mb-2 h-4 w-4" /> 9 support tickets are breaching SLA.
          </div>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {adminStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Course and batch operations</CardTitle>
              <CardDescription>Publish content, assign instructors, and review cohort performance.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <THead><TR><TH>Course</TH><TH>Progress</TH><TH>Level</TH><TH>Lessons</TH></TR></THead>
                <TBody>
                  {courses.map((course) => (
                    <TR key={course.slug}>
                      <TD className="font-semibold text-white">{course.title}</TD>
                      <TD>{course.progress}% average</TD>
                      <TD>{course.level}</TD>
                      <TD>{course.lessons}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit log</CardTitle>
              <CardDescription>Immutable admin activity for compliance and accountability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {auditEvents.map((event) => (
                <div key={`${event.actor}-${event.time}`} className="rounded-2xl bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold"><Activity className="h-4 w-4 text-accent" />{event.action}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{event.actor} → {event.target}</p>
                  <p className="mt-2 text-xs text-accent">{event.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          {["Certificate approvals", "Invoice reconciliation", "Assignment review"].map((task) => (
            <Card key={task}><CardContent className="flex items-center gap-3 p-5"><FileText className="h-5 w-5 text-accent" /><span className="font-semibold">{task}</span></CardContent></Card>
          ))}
        </section>
      </main>
    </>
  );
}
