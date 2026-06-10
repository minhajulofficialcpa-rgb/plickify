import { deleteProductAction, saveProductAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { ActionButton, AdminSection, AdminTable, Field, HiddenId, Select, StatusBadge, Textarea } from "@/components/admin/admin-resource-page";
import type { AdminProductRow } from "@/lib/admin-dashboard";
import { formatBdt } from "@/lib/admin-dashboard";
import { formatAccessType, formatProductCategory } from "@/lib/public-data";

const categoryOptions = [
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
  { label: "Software", value: "software" },
  { label: "Subscription", value: "subscription" },
  { label: "Manual Service", value: "manual_service" }
];

const accessOptions = [
  { label: "Free", value: "free" },
  { label: "Paid purchase", value: "purchase" },
  { label: "Manual activation", value: "manual" },
  { label: "Subscription activation", value: "subscription" }
];

export function ProductManager({ products }: { products: AdminProductRow[] }) {
  return <div className="grid gap-6"><AdminSection title="Create product" description="Private file paths are stored for server-side signed URLs and are never rendered publicly."><form action={saveProductAction} className="grid gap-4 md:grid-cols-2"><Field label="Title" name="title" /><Field label="Slug" name="slug" /><Select label="Category" name="category" options={categoryOptions} /><Field label="Price BDT" name="priceBdt" type="number" defaultValue="0" /><Select label="Access type" name="accessType" options={accessOptions} /><Select label="Status" name="status" options={["draft", "published", "archived"]} /><Field label="Private file path" name="privateFilePath" placeholder="products/private/file.zip" /><div className="md:col-span-2"><Textarea label="Description" name="description" /></div><div className="md:col-span-2"><ActionButton>Create product</ActionButton></div></form></AdminSection><AdminSection title="Products"><AdminTable rows={products} emptyLabel="No products yet." columns={[{ header: "Product", cell: (row) => <div><p className="font-bold text-white">{row.title}</p><p>{row.slug}</p></div> }, { header: "Category", cell: (row) => formatProductCategory(row.category) }, { header: "Price", cell: (row) => formatBdt(row.price_bdt) }, { header: "Access", cell: (row) => formatAccessType(row.access_type) }, { header: "Private file", cell: (row) => row.private_file_path ? <span className="text-xs">Configured</span> : <span className="text-xs text-muted-foreground">None</span> }, { header: "Status", cell: (row) => <StatusBadge value={row.status} /> }, { header: "Action", cell: (row) => <form action={deleteProductAction}><HiddenId id={row.id} /><Button type="submit" variant="ghost" size="sm">Delete</Button></form> }]} /></AdminSection></div>;
}
