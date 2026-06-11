import { Pencil, Trash2 } from "lucide-react";
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

const statusOptions = ["draft", "published", "archived"];

export function ProductManager({ products }: { products: AdminProductRow[] }) {
  return (
    <div className="grid gap-6">
      <AdminSection title="Create product" description="Private file paths are stored for server-side signed URLs and are never rendered publicly.">
        <ProductForm submitLabel="Create product" />
      </AdminSection>
      <AdminSection title="Products" description="Open a row to edit product copy, access type, status, and private file path.">
        <AdminTable rows={products} emptyLabel="No products yet." columns={[
          { header: "Product", cell: (row) => <div><p className="font-bold text-foreground">{row.title}</p><p>{row.slug}</p></div> },
          { header: "Category", cell: (row) => formatProductCategory(row.category) },
          { header: "Price", cell: (row) => formatBdt(row.price_bdt) },
          { header: "Access", cell: (row) => formatAccessType(row.access_type) },
          { header: "Private file", cell: (row) => row.private_file_path ? <span className="text-xs">Configured</span> : <span className="text-xs text-muted-foreground">None</span> },
          { header: "Status", cell: (row) => <StatusBadge value={row.status} /> },
          { header: "Edit", cell: (row) => <ProductEditPanel product={row} /> }
        ]} />
      </AdminSection>
    </div>
  );
}

function ProductForm({ product, submitLabel }: { product?: AdminProductRow; submitLabel: string }) {
  return (
    <form action={saveProductAction} className="grid gap-4 md:grid-cols-2">
      {product ? <HiddenId id={product.id} /> : null}
      <Field label="Title" name="title" defaultValue={product?.title ?? ""} />
      <Field label="Slug" name="slug" defaultValue={product?.slug ?? ""} />
      <Select label="Category" name="category" options={categoryOptions} />
      <Field label="Price BDT" name="priceBdt" type="number" defaultValue={String(product?.price_bdt ?? 0)} />
      <Select label="Access type" name="accessType" options={accessOptions} />
      <Select label="Status" name="status" options={statusOptions} />
      <Field label="Private file path" name="privateFilePath" placeholder="products/private/file.zip" defaultValue={product?.private_file_path ?? ""} />
      <div className="md:col-span-2"><Textarea label="Description" name="description" defaultValue={product?.description ?? ""} /></div>
      <div className="md:col-span-2"><ActionButton>{submitLabel}</ActionButton></div>
    </form>
  );
}

function ProductEditPanel({ product }: { product: AdminProductRow }) {
  return (
    <details className="min-w-[18rem] rounded-lg border border-border bg-muted/30 p-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-foreground"><Pencil className="h-4 w-4 text-accent" /> Edit</summary>
      <div className="mt-4 grid gap-4 border-t border-border pt-4">
        <ProductForm product={product} submitLabel="Save product" />
        <form action={deleteProductAction}>
          <HiddenId id={product.id} />
          <Button type="submit" variant="ghost" size="sm"><Trash2 className="h-4 w-4" /> Delete product</Button>
        </form>
      </div>
    </details>
  );
}
