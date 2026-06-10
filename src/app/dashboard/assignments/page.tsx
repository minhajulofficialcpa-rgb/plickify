import { FileCheck2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { firstRelation } from "@/lib/lms";
import { getStudentAssignments } from "@/lib/student-dashboard";
import { formatDate } from "@/lib/public-data";

export default async function DashboardAssignmentsPage() {
  const { user } = await requireOnboardedUser();
  const assignments = await getStudentAssignments(user.id);

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Assignments</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Pending assignments</h1>
      <p className="mt-3 text-muted-foreground">Course tasks and submissions will appear here when assigned.</p>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {assignments.length ? assignments.map((assignment) => {
          const course = firstRelation(assignment.courses);
          return <Card key={assignment.id}><CardHeader><FileCheck2 className="h-6 w-6 text-accent" /><CardTitle>{assignment.title}</CardTitle><CardDescription>{course?.title ?? "Course assignment"} - due {formatDate(assignment.due_at)}</CardDescription></CardHeader></Card>;
        }) : <Empty label="No pending assignments." />}
      </section>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">{label}</div>;
}
