import Link from "next/link";
import { Award, FileCheck2, HelpCircle, ReceiptText } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { courses } from "@/lib/data";

export default function StudentDashboardPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Badge>Student dashboard</Badge>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-6xl">Keep learning momentum visible.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Students can resume lessons, submit assignments, download invoices, open support tickets, and verify certificates.</p>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.slug}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex justify-between text-sm"><span>Progress</span><span>{course.progress}%</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-accent" style={{ width: `${course.progress}%` }} /></div>
                <Button asChild className="mt-5 w-full" variant="secondary"><Link href={`/courses/${course.slug}`}>Continue course</Link></Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { label: "Assignments", value: "4 pending", icon: FileCheck2 },
            { label: "Certificates", value: "2 earned", icon: Award },
            { label: "Invoices", value: "6 paid", icon: ReceiptText },
            { label: "Support", value: "1 open", icon: HelpCircle }
          ].map((item) => (
            <Card key={item.label}><CardContent className="p-5"><item.icon className="mb-4 h-6 w-6 text-accent" /><p className="font-bold">{item.label}</p><p className="text-sm text-muted-foreground">{item.value}</p></CardContent></Card>
          ))}
        </section>
      </main>
    </>
  );
}
