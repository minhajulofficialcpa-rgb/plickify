import { FileCheck2 } from "lucide-react";
import { submitAssignmentAction } from "@/actions/student";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireOnboardedUser } from "@/lib/auth";
import { firstRelation } from "@/lib/lms";
import { getStudentAssignments } from "@/lib/student-dashboard";
import { formatDate } from "@/lib/public-data";

const textareaClass = "min-h-28 w-full rounded-[1rem] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10";

export default async function DashboardAssignmentsPage() {
  const { user } = await requireOnboardedUser();
  const assignments = await getStudentAssignments(user.id);

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Assignments</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Batch assignments</h1>
      <p className="mt-3 text-muted-foreground">Submit your work and track reviewed marks from your dashboard.</p>
      <section className="mt-8 grid gap-5">
        {assignments.length ? assignments.map((assignment) => {
          const course = firstRelation(assignment.courses);
          const batch = firstRelation(assignment.batches);
          const submission = firstRelation(assignment.assignment_submissions);
          const marks = submission?.marks ?? submission?.score ?? null;
          return (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <FileCheck2 className="h-6 w-6 text-accent" />
                    <CardTitle className="mt-3">{assignment.title}</CardTitle>
                    <CardDescription>{course?.title ?? "Course"} - {batch?.title ?? "Batch"} - due {formatDate(assignment.due_at)}</CardDescription>
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase text-muted-foreground">{submission?.status ?? "not submitted"}</div>
                </div>
                {assignment.instructions ? <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">{assignment.instructions}</p> : null}
                {assignment.attachment_url ? <a href={assignment.attachment_url} className="mt-3 inline-flex text-sm font-semibold text-accent">Open attachment</a> : null}
                {submission ? (
                  <div className="mt-5 rounded-[1rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-muted-foreground">
                    <p className="font-bold text-white">Submission result</p>
                    <p className="mt-1">Marks: {marks ?? "Pending"}{marks !== null ? ` / ${assignment.max_marks ?? assignment.max_score ?? 100}` : ""}</p>
                    {submission.feedback ? <p className="mt-2 whitespace-pre-wrap">{submission.feedback}</p> : null}
                  </div>
                ) : null}
              </CardHeader>
              <form action={submitAssignmentAction} className="grid gap-4 px-6 pb-6 md:grid-cols-2">
                <input type="hidden" name="assignmentId" value={assignment.id} />
                <div className="grid gap-2 md:col-span-2"><Label htmlFor={`submissionText-${assignment.id}`}>Submission text</Label><textarea id={`submissionText-${assignment.id}`} name="submissionText" className={textareaClass} defaultValue={submission?.submission_text ?? ""} /></div>
                <div className="grid gap-2"><Label htmlFor={`submissionUrl-${assignment.id}`}>URL</Label><Input id={`submissionUrl-${assignment.id}`} name="submissionUrl" type="url" defaultValue={submission?.submission_url ?? ""} /></div>
                <div className="grid gap-2"><Label htmlFor={`githubUrl-${assignment.id}`}>GitHub link</Label><Input id={`githubUrl-${assignment.id}`} name="githubUrl" type="url" defaultValue={submission?.github_url ?? ""} /></div>
                <div className="grid gap-2 md:col-span-2"><Label htmlFor={`attachmentUrl-${assignment.id}`}>File URL</Label><Input id={`attachmentUrl-${assignment.id}`} name="attachmentUrl" type="url" defaultValue={submission?.attachment_url ?? ""} /></div>
                <Button type="submit" variant="accent">{submission ? "Update submission" : "Submit assignment"}</Button>
              </form>
            </Card>
          );
        }) : <Empty label="No assignments are available for your active batches." />}
      </section>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">{label}</div>;
}
