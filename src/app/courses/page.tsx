import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBdt, getPublishedCourses } from "@/lib/public-data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "All Courses", description: "Browse Plickify courses and choose the right learning path.", path: "/courses" });
export const revalidate = 300;

export default async function CoursesPage() {
  const courses = await getPublishedCourses(24);

  return (
    <>
      <PublicHeader />
      <main className="bg-background text-foreground">
        <section className="border-b border-border bg-[var(--surface-subtle)] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-accent">All course</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-foreground sm:text-6xl">Choose a practical Plickify learning path.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Courses are built around modules, batches, assignments, support, and verified completion.</p>
          </div>
        </section>
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {courses.length ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3 text-sm font-bold text-muted-foreground">
                        <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-accent" /> Course</span>
                        <span className="text-accent">{formatBdt(course.price_bdt)}</span>
                      </div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                      <div className="pt-4"><Button asChild variant="secondary"><Link href={`/courses/${course.slug}`}>View details <ArrowRight className="h-4 w-4" /></Link></Button></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
                <h2 className="text-2xl font-black text-foreground">No courses published yet</h2>
                <p className="mt-3 text-muted-foreground">Published courses will appear here automatically.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
