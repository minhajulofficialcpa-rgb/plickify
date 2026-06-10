import { saveAssignmentAction, updateAssignmentSubmissionAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, AdminSection, AdminTable, Field, HiddenId, Select, StatusBadge, Textarea } from "@/components/admin/admin-resource-page";
import { firstAdminRelation, getAdminAssignments, getAdminBatches, getAdminCourses } from "@/lib/admin-dashboard";

export default async function AdminAssignmentsPage() {
  const [{ assignments, submissions }, courses, batches] = await Promise.all([getAdminAssignments(), getAdminCourses(), getAdminBatches()]);
  const courseOptions = courses.map((course) => ({ label: course.title, value: course.id }));
  const batchOptions = batches.map((batch) => ({ label: batch.title, value: batch.id }));

  return (
    <div>
      <AdminPageHeader eyebrow="Learning" title="Assignments" description="Create batch assignments and review student submissions." />
      <div className="mt-8 grid gap-6">
        <AdminSection title="Create assignment">
          <form action={saveAssignmentAction} className="grid gap-4 md:grid-cols-2">
            <Select label="Course" name="courseId" options={courseOptions} />
            <Select label="Batch" name="batchId" options={batchOptions} />
            <Field label="Title" name="title" />
            <Field label="Deadline" name="deadline" type="datetime-local" />
            <Field label="Max marks" name="maxMarks" type="number" defaultValue="100" />
            <Field label="Attachment URL" name="attachmentUrl" type="url" required={false} />
            <Select label="Status" name="status" options={["draft", "published", "archived"]} />
            <div className="md:col-span-2"><Textarea label="Instructions" name="instructions" /></div>
            <Button type="submit" variant="accent">Create assignment</Button>
          </form>
        </AdminSection>

        <AdminSection title="Assignments">
          <AdminTable rows={assignments} emptyLabel="No assignments found." columns={[
            { header: "Assignment", cell: (row) => <div><p className="font-bold text-white">{row.title}</p><p>{firstAdminRelation(row.courses)?.title ?? row.course_id ?? "Course"} - {firstAdminRelation(row.batches)?.title ?? row.batch_id ?? "Batch"}</p></div> },
            { header: "Deadline", cell: (row) => row.due_at ? new Date(row.due_at).toLocaleString("en-BD") : "-" },
            { header: "Max", cell: (row) => row.max_marks ?? row.max_score ?? 100 },
            { header: "Status", cell: (row) => <StatusBadge value={row.status} /> },
            { header: "Attachment", cell: (row) => row.attachment_url ? <a href={row.attachment_url} className="text-accent">Open</a> : "-" }
          ]} />
        </AdminSection>

        <AdminSection title="Submissions">
          <AdminTable rows={submissions} emptyLabel="No submissions found." columns={[
            { header: "Submission", cell: (row) => <div><p className="font-bold text-white">{firstAdminRelation(row.assignments)?.title ?? row.assignment_id}</p><p>{firstAdminRelation(row.profiles)?.email ?? row.user_id}</p></div> },
            { header: "Content", cell: (row) => <div className="max-w-xs"><p className="line-clamp-3">{row.submission_text ?? "-"}</p>{row.submission_url ? <a href={row.submission_url} className="text-accent">URL</a> : null} {row.github_url ? <a href={row.github_url} className="ml-2 text-accent">GitHub</a> : null} {row.attachment_url ? <a href={row.attachment_url} className="ml-2 text-accent">File</a> : null}</div> },
            { header: "Status", cell: (row) => <StatusBadge value={row.status} /> },
            { header: "Marks", cell: (row) => row.marks ?? row.score ?? "-" },
            { header: "Review", cell: (row) => <form action={updateAssignmentSubmissionAction} className="grid min-w-48 gap-2"><HiddenId id={row.id} /><Select label="Status" name="status" options={["submitted", "graded", "returned", "late"]} /><Field label="Marks" name="marks" type="number" required={false} /><Textarea label="Feedback" name="feedback" /><Button type="submit" size="sm" variant="accent">Review</Button></form> }
          ]} />
        </AdminSection>
      </div>
    </div>
  );
}
