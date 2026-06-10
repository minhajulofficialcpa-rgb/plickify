import Link from "next/link";
import type { Route } from "next";
import { CalendarDays } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { firstRelation } from "@/lib/lms";
import { getStudentBatches } from "@/lib/student-dashboard";
import { formatDate } from "@/lib/public-data";

export default async function DashboardBatchesPage() {
  const { user } = await requireOnboardedUser();
  const batches = await getStudentBatches(user.id);

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Batches</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Assigned batches</h1>
      <p className="mt-3 text-muted-foreground">Batch access is additive, so previous batches remain visible when new ones are assigned.</p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {batches.length ? batches.map((row) => {
          const batch = firstRelation(row.batches);
          const course = firstRelation(row.courses);
          return (
            <Card key={row.id}>
              <CardHeader>
                <CalendarDays className="h-6 w-6 text-accent" />
                <CardTitle>{batch?.title ?? "Assigned batch"}</CardTitle>
                <CardDescription>{course?.title ?? "Course"}</CardDescription>
              </CardHeader>
              <div className="grid gap-2 px-6 pb-6 text-sm text-muted-foreground">
                <span>Status: {row.status}</span>
                <span>Starts: {formatDate(batch?.starts_at)}</span>
                {course ? <Link href={`/dashboard/courses/${course.id}` as Route} className="font-semibold text-accent">Open course</Link> : null}
              </div>
            </Card>
          );
        }) : <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">No batch assignments yet.</div>}
      </section>
    </div>
  );
}
