import { ProductManager } from "@/components/admin/product-manager";
import { AdminPageHeader } from "@/components/admin/admin-resource-page";
import { getAdminProducts } from "@/lib/admin-dashboard";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  return <div><AdminPageHeader eyebrow="Shop" title="Products" description="Create, update, and delete digital products with access metadata." /><div className="mt-8"><ProductManager products={products} /></div></div>;
}
