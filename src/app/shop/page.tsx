import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBdt, getPublishedProducts } from "@/lib/public-data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Shop", description: "Browse Plickify digital products and downloadable learning resources.", path: "/shop" });
export const revalidate = 300;

export default async function ShopPage() {
  const products = await getPublishedProducts(12);

  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">Digital shop</p>
            <h1 className="mt-5 text-5xl font-black text-white sm:text-6xl">Resources that help you move faster.</h1>
          </div>
          <p className="text-lg leading-8 text-muted-foreground">Downloadable kits, templates, and operating resources for course creators and digital sellers.</p>
        </section>
        <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <p className="text-sm font-semibold text-accent">{formatBdt(product.price_bdt)}</p>
                <CardTitle>{product.title}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
                <a href={`/products/${product.slug}`} className="pt-4 text-sm font-semibold text-white">View product</a>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
