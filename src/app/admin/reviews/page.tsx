import { updateReviewStatusAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, AdminSection, AdminTable, HiddenId, Select, StatusBadge } from "@/components/admin/admin-resource-page";
import { firstAdminRelation, getAdminReviews } from "@/lib/admin-dashboard";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();
  return <div><AdminPageHeader eyebrow="Moderation" title="Reviews" description="Approve or reject student feedback before public display." /><div className="mt-8"><AdminSection title="Reviews"><AdminTable rows={reviews} emptyLabel="No reviews found." columns={[{ header: "Review", cell: (row) => <div><p className="font-bold text-white">{row.title ?? "Untitled review"}</p><p>{firstAdminRelation(row.profiles)?.email ?? row.user_id ?? "-"}</p></div> }, { header: "Rating", cell: (row) => row.rating ?? "-" }, { header: "Status", cell: (row) => <StatusBadge value={row.status} /> }, { header: "Action", cell: (row) => <form action={updateReviewStatusAction} className="grid gap-2"><HiddenId id={row.id} /><Select label="Status" name="status" options={["pending", "approved", "rejected"]} /><Button type="submit" size="sm" variant="accent">Update</Button></form> }]} /></AdminSection></div></div>;
}
