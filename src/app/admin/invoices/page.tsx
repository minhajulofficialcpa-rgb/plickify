import { AdminPageHeader, AdminSection, AdminTable, StatusBadge } from "@/components/admin/admin-resource-page";
import { firstRelation, getAdminInvoices } from "@/lib/admin-verification";
import { formatBdt } from "@/lib/admin-dashboard";
import { formatDate } from "@/lib/public-data";

export default async function AdminInvoicesPage() {
  const invoices = await getAdminInvoices();

  return (
    <div>
      <AdminPageHeader eyebrow="Finance" title="Invoices" description="View invoices generated after successful paid orders and open public verification records." />
      <div className="mt-8 grid gap-6">
        <AdminSection title="Issued invoices">
          <AdminTable
            rows={invoices}
            emptyLabel="No invoices found."
            columns={[
              { header: "Invoice", cell: (row) => <div><p className="font-bold text-white">{row.invoice_number}</p><p>{row.invoice_code ?? row.invoice_number}</p>{row.invoice_url ? <a className="text-accent" href={row.invoice_url}>Verify page</a> : null}</div> },
              { header: "Student", cell: (row) => firstRelation(row.profiles)?.email ?? row.user_id },
              { header: "Item", cell: (row) => firstRelation(row.courses)?.title ?? firstRelation(row.products)?.title ?? row.course_id ?? row.product_id ?? "-" },
              { header: "Amount", cell: (row) => formatBdt(row.amount_bdt) },
              { header: "Status", cell: (row) => <StatusBadge value={row.status} /> },
              { header: "Issued", cell: (row) => formatDate(row.issued_at) },
              { header: "Paid", cell: (row) => formatDate(row.paid_at) }
            ]}
          />
        </AdminSection>
      </div>
    </div>
  );
}
