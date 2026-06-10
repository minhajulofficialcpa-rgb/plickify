import { notFound } from "next/navigation";
import { Download, FileArchive, ShieldCheck } from "lucide-react";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBdt, getProductBySlug } from "@/lib/public-data";
import { createMetadata, productSchema } from "@/lib/seo";

export const revalidate = 300;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return createMetadata({ title: "Product not found", path: `/products/${slug}` });

  return createMetadata({
    title: product.title,
    description: product.description ?? "Explore this Plickify digital product.",
    path: `/products/${product.slug}`
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const accessType = product.file_path ? "Instant digital access" : "Access details after purchase";

  return (
    <>
      <PublicHeader />
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">Digital product</p>
            <h1 className="mt-5 text-5xl font-black text-white sm:text-6xl">{product.title}</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">{product.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent"><a href="/login">Buy now</a></Button>
              <Button asChild variant="secondary"><a href="/contact">Ask a question</a></Button>
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Price</p>
            <p className="mt-3 text-5xl font-black text-white">{formatBdt(product.price_bdt)}</p>
            <div className="mt-8 grid gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><FileArchive className="h-4 w-4 text-accent" /> Category: learning resource</span>
              <span className="flex items-center gap-2"><Download className="h-4 w-4 text-accent" /> {accessType}</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Secure account-based delivery</span>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <Card><CardHeader><CardTitle>What you get</CardTitle><CardDescription>Downloadable resources prepared for immediate use after access is granted.</CardDescription></CardHeader></Card>
          <Card><CardHeader><CardTitle>Best for</CardTitle><CardDescription>Creators and operators who want practical templates without a full course commitment.</CardDescription></CardHeader></Card>
          <Card><CardHeader><CardTitle>Support</CardTitle><CardDescription>Questions can be routed through the support workflow after purchase.</CardDescription></CardHeader></Card>
        </section>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema(product)) }} />
      </main>
      <PublicFooter />
    </>
  );
}
