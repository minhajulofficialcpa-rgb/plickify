import Image from "next/image";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "About", description: "Learn how Plickify supports practical online education and digital products.", path: "/about" });

const values = [
  ["Practical learning", "Courses focus on repeatable skills, clear milestones, and useful outcomes."],
  ["Digital delivery", "Products, certificates, invoices, and support are shaped for online businesses."],
  ["Trust by design", "Authentication, profile locking, roles, and audit trails are part of the foundation."]
];

export default function AboutPage() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">About Plickify</p>
            <h1 className="mt-5 text-5xl font-black text-white sm:text-6xl">A calm operating base for learning businesses.</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">Plickify brings LMS workflows and digital shop essentials together so course creators can teach, sell, support, and verify outcomes without scattering their work across disconnected tools.</p>
          </div>
          <Image src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80" alt="Team planning an online education business" width={1200} height={900} className="aspect-[4/3] w-full rounded-[1.25rem] object-cover" priority />
        </section>
        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {values.map(([title, description]) => (
            <Card key={title}><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader></Card>
          ))}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
