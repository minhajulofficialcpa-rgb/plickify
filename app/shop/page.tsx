import Link from "next/link";
import { Download, LockKeyhole } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { products } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function ShopPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Badge>Phase 9 · Shop and digital delivery</Badge>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-[-0.06em]">Digital products with protected delivery.</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Sell templates, recordings, resources, and bundles. Files stay private in Supabase Storage until PipraPay verifies the invoice.
            </p>
          </div>
          <Button asChild variant="accent"><Link href="/checkout">Go to checkout</Link></Button>
        </div>
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {products.map((product) => (
            <Card key={product.name}>
              <CardHeader>
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent"><Download className="h-6 w-6" /></div>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.type} · Delivered after verified payment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-accent">{formatCurrency(product.price)}</p>
                <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><LockKeyhole className="h-4 w-4" /> Private Supabase Storage delivery</div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
}
