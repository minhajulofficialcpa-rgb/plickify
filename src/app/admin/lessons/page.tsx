import { AdminPageHeader, AdminSection, AdminTable, StatusBadge } from "@/components/admin/admin-resource-page";
import { getAdminLessons } from "@/lib/admin-dashboard";

export default async function AdminLessonsPage() {
  const lessons = await getAdminLessons();
  return <div><AdminPageHeader eyebrow="Content" title="Lessons" description="Review lesson order, lock state, preview status, and batch assignment." /><div className="mt-8"><AdminSection title="Lessons"><AdminTable rows={lessons} emptyLabel="No lessons found." columns={[{ header: "Lesson", cell: (row) => <div><p className="font-bold text-white">{row.position}. {row.title}</p><p>{row.description ?? row.course_id}</p></div> }, { header: "Status", cell: (row) => <StatusBadge value={row.status} /> }, { header: "Lock", cell: (row) => row.is_locked ? "Locked" : "Unlocked" }, { header: "Preview", cell: (row) => row.is_preview ? "Yes" : "No" }, { header: "Duration", cell: (row) => `${Math.round(row.duration_seconds / 60)} min` }]} /></AdminSection></div></div>;
}
