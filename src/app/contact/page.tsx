import { submitContactMessageAction } from "@/actions";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Contact", description: "Contact Plickify for course, product, and support questions.", path: "/contact" });

type ContactPageProps = {
  searchParams: Promise<{ sent?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;

  return (
    <>
      <PublicHeader />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">Contact</p>
          <h1 className="mt-5 text-5xl font-black text-white sm:text-6xl">Tell us what you want to build or learn.</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">Ask about courses, batches, products, certificates, invoices, or partnership ideas. A concise message is enough to start.</p>
          <Card className="mt-8"><CardHeader><CardTitle>Response focus</CardTitle><CardDescription>We route messages into the support workflow so the right team member can follow up.</CardDescription></CardHeader></Card>
        </section>
        <section className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-6">
          {params.sent === "1" ? <p className="mb-5 rounded-full bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">Message received. Thank you.</p> : null}
          <form action={submitContactMessageAction} className="grid gap-4">
            <div className="grid gap-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required autoComplete="name" /></div>
            <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>
            <div className="grid gap-2"><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" /></div>
            <div className="grid gap-2"><Label htmlFor="message">Message</Label><textarea id="message" name="message" required rows={7} className="w-full rounded-[1rem] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10" /></div>
            <Button type="submit" variant="accent">Send message</Button>
          </form>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
