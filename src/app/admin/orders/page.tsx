import { AdminPageHeader, AdminSection, AdminTable, StatusBadge } from "@/components/admin/admin-resource-page";
import { firstAdminRelation, formatBdt, getAdminOrders } from "@/lib/admin-dashboard";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  return <div><AdminPageHeader eyebrow="Shop" title="Orders" description="View order status, payment status, and totals." /><div className="mt-8"><AdminSection title="Orders"><AdminTable rows={orders} emptyLabel="No orders found." columns={[{ header: "Order", cell: (row) => <div><p className="font-bold text-white">{row.order_number ?? row.id}</p><p>{firstAdminRelation(row.profiles)?.email ?? row.user_id ?? "Guest"}</p></div> }, { header: "Status", cell: (row) => <StatusBadge value={row.status} /> }, { header: "Payment", cell: (row) => <StatusBadge value={row.payment_status} /> }, { header: "Total", cell: (row) => formatBdt(row.total_bdt) }, { header: "Created", cell: (row) => new Date(row.created_at).toLocaleString("en-BD") }]} /></AdminSection></div></div>;
}
