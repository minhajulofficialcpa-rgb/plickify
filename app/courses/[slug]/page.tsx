import { notFound } from "next/navigation";
import { Clock, FileCheck2, Video } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { courses } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);
  if (!course) notFound();

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Badge>{course.level}</Badge>
        <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-0.06em]">{course.title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{course.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="accent">Enroll for {formatCurrency(course.price)}</Button>
          <Button variant="secondary">Download syllabus</Button>
        </div>
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[{ label: "Lessons", value: course.lessons, icon: Video }, { label: "Duration", value: "8 weeks", icon: Clock }, { label: "Assignments", value: "12 graded", icon: FileCheck2 }].map((item) => (
            <Card key={item.label}><CardContent className="p-5"><item.icon className="mb-4 h-6 w-6 text-accent" /><p className="text-sm text-muted-foreground">{item.label}</p><p className="text-2xl font-black">{item.value}</p></CardContent></Card>
          ))}
        </section>
      </main>
    </>
  );
}
