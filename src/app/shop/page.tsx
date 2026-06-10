import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAccessType, formatBdt, formatProductCategory, getPublishedProducts } from "@/lib/public-data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Shop", description: "Browse Plickify digital products and downloadable learning resources.", path: "/shop" });
export const revalidate = 300;

const categories = [
  { label: "All", value: "all" },
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
  { label: "Software", value: "software" },
  { label: "Subscription", value: "subscription" },
  { label: "Manual Service", value: "manual_service" }
];

type ShopPageProps = {
  searchParams?: Promise<{ category?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const selectedCategory = params?.category ?? "all";
  const products = await getPublishedProducts(24, selectedCategory);

  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">Digital shop</p>
            <h1 className="mt-5 text-5xl font-black text-white sm:text-6xl">Resources that help you move faster.</h1>
          </div>
          <p className="text-lg leading-8 text-muted-foreground">Downloadable kits, software resources, subscriptions, and manual services for course creators and digital sellers.</p>
        </section>
        <nav className="mt-10 flex flex-wrap gap-2" aria-label="Product categories">
          {categories.map((category) => {
            const active = selectedCategory === category.value;
            return <a key={category.value} href={category.value === "all" ? "/shop" : `/shop?category=${category.value}`} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-accent text-slate-950" : "bg-white/10 text-white hover:bg-white/15"}`}>{category.label}</a>;
          })}
        </nav>
        <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-accent"><span>{formatProductCategory(product.category)}</span><span>{formatBdt(product.price_bdt)}</span></div>
                <CardTitle>{product.title}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
                <p className="text-sm text-muted-foreground">{formatAccessType(product.access_type)}</p>
                <a href={`/products/${product.slug}`} className="pt-4 text-sm font-semibold text-white">View product</a>
              </CardHeader>
            </Card>
          ))}
          {!products.length ? <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">No products found in this category.</div> : null}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
