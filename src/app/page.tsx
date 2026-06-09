import Link from "next/link";
import { ArrowRight, GraduationCap, ShieldCheck, Store } from "lucide-react";
import { PublicHeader } from "@/components/public/header";
import { MotionHero } from "@/components/public/motion-hero";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  { title: "LMS foundation", description: "Course, dashboard, auth, and role scaffolding ready for implementation.", icon: GraduationCap },
  { title: "Digital shop ready", description: "Clean structure for products, delivery, checkout, and future payment phases.", icon: Store },
  { title: "Security first", description: "Server-only Supabase admin client, typed validations, and permission helpers.", icon: ShieldCheck }
];

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <MotionHero>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">Plickify base setup</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-0.06em] sm:text-7xl">
            Production-ready LMS and digital shop scaffold.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            A clean Next.js 15 App Router foundation with TypeScript, Tailwind, shadcn/ui-style primitives, Framer Motion, Supabase, Zod, and React Hook Form.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="accent"><Link href="/dashboard">Open dashboard <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="secondary"><Link href="/admin">Open admin</Link></Button>
          </div>
        </MotionHero>
        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {highlights.map((highlight) => (
            <Card key={highlight.title}>
              <CardHeader>
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent"><highlight.icon className="h-6 w-6" /></div>
                <CardTitle>{highlight.title}</CardTitle>
                <CardDescription>{highlight.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
}
