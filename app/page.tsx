import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, LockKeyhole, PlayCircle } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { MotionSection } from "@/components/motion-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { courses, features, products } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <MotionSection className="grid min-h-[calc(100vh-4.5rem)] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge>Next.js 15 + Supabase + PipraPay</Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              LMS, cohorts, and digital product sales in one platform.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Plickify helps education businesses sell courses and downloads, run live batches, grade assignments, issue certificates, handle support, and reconcile Bangladesh payments.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="accent"><Link href="/checkout">Launch checkout <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="secondary"><Link href="/dashboard/admin">View admin dashboard</Link></Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/15 text-white">Live cohort</Badge>
                <span className="text-sm text-accent">Enrollment open</span>
              </div>
              <CardTitle className="text-3xl">Digital Product Studio</CardTitle>
              <CardDescription>40 lessons • assignments • certificate • lifetime recordings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-3xl bg-gradient-to-br from-primary/40 via-accent/20 to-white/5 p-5">
                <div className="flex items-center gap-3">
                  <PlayCircle className="h-10 w-10 text-accent" />
                  <div>
                    <p className="font-semibold">Module 04: Launch funnel build</p>
                    <p className="text-sm text-muted-foreground">Next live class starts tonight at 8:30 PM</p>
                  </div>
                </div>
                <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[76%] rounded-full bg-accent" /></div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="rounded-2xl bg-black/20 p-3"><strong className="block text-xl">2.8k</strong>students</div>
                  <div className="rounded-2xl bg-black/20 p-3"><strong className="block text-xl">৳8.4L</strong>MRR</div>
                  <div className="rounded-2xl bg-black/20 p-3"><strong className="block text-xl">76%</strong>complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionSection>

        <MotionSection id="platform" className="py-20">
          <div className="max-w-3xl">
            <Badge>Platform modules</Badge>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Built for serious online education operations.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent"><feature.icon className="h-6 w-6" /></div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="courses" className="py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Badge>Courses + shop</Badge>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Sell cohorts, self-paced courses, and digital assets.</h2>
              <p className="mt-5 text-muted-foreground">Every purchase creates an invoice, unlocks Supabase Storage assets, and adds the learner to the correct course or product entitlement.</p>
            </div>
            <div className="grid gap-4">
              {courses.map((course) => (
                <Card key={course.slug}>
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link href={`/courses/${course.slug}`} className="text-xl font-bold hover:text-accent">{course.title}</Link>
                      <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
                    </div>
                    <div className="text-right"><p className="font-black text-accent">{formatCurrency(course.price)}</p><p className="text-xs text-muted-foreground">{course.lessons} lessons</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection id="payments" className="py-20">
          <Card className="grid gap-8 p-6 lg:grid-cols-[1fr_0.9fr] lg:p-10">
            <div>
              <Badge>Payments and compliance</Badge>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">PipraPay checkout with bKash, Nagad, and Rocket flows.</h2>
              <p className="mt-5 text-muted-foreground">Signed webhooks update invoices, payment records, enrollments, analytics events, and audit logs while Supabase RLS keeps each student isolated to their own data.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["bKash", "Nagad", "Rocket"].map((method) => <div key={method} className="rounded-2xl border border-white/10 bg-white/5 p-4 font-bold"><Banknote className="mb-3 h-5 w-5 text-accent" />{method}</div>)}
              </div>
            </div>
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.name} className="flex items-center justify-between rounded-2xl bg-black/20 p-4">
                  <div><p className="font-semibold">{product.name}</p><p className="text-sm text-muted-foreground">{product.type}</p></div>
                  <p className="font-black">{formatCurrency(product.price)}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm text-accent"><LockKeyhole className="h-4 w-4" /> Supabase Auth, Storage, PostgreSQL, and RLS ready</div>
            </div>
          </Card>
        </MotionSection>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© 2026 Plickify. Production LMS + digital commerce.</p>
        <p className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-accent" /> Audit-ready architecture</p>
      </footer>
    </>
  );
}
