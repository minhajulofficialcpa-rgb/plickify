import { AdminPageHeader, AdminSection, AdminTable, StatusBadge } from "@/components/admin/admin-resource-page";
import { getAdminBatches } from "@/lib/admin-dashboard";

export default async function AdminBatchesPage() {
  const batches = await getAdminBatches();
  return <div><AdminPageHeader eyebrow="Content" title="Batches" description="Review course batches, capacity, and activation status." /><div className="mt-8"><AdminSection title="Batches"><AdminTable rows={batches} emptyLabel="No batches found." columns={[{ header: "Batch", cell: (row) => <div><p className="font-bold text-white">{row.title}</p><p>{row.course_id}</p></div> }, { header: "Status", cell: (row) => <StatusBadge value={row.status} /> }, { header: "Starts", cell: (row) => row.starts_at ? new Date(row.starts_at).toLocaleString("en-BD") : "-" }, { header: "Ends", cell: (row) => row.ends_at ? new Date(row.ends_at).toLocaleString("en-BD") : "-" }, { header: "Seats", cell: (row) => row.capacity ?? "Open" }]} /></AdminSection></div></div>;
}
