import Link from "next/link";
import { Bell, BookOpen, CalendarDays, CheckCircle2, FileCheck2, GraduationCap, LineChart, Receipt } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { firstRelation } from "@/lib/lms";
import { getStudentDashboardSnapshot } from "@/lib/student-dashboard";

export default async function DashboardPage() {
  const { user } = await requireOnboardedUser();
  const snapshot = await getStudentDashboardSnapshot(user.id);

  const cards = [
    { href: "/dashboard/courses", label: "Enrolled courses", value: snapshot.stats.enrolledCourses, icon: BookOpen },
    { href: "/dashboard/batches", label: "Active batches", value: snapshot.stats.activeBatches, icon: CalendarDays },
    { href: "/dashboard/courses", label: "Lesson progress", value: snapshot.stats.lessonProgress, icon: LineChart },
    { href: "/dashboard/assignments", label: "Pending assignments", value: snapshot.stats.pendingAssignments, icon: FileCheck2 },
    { href: "/dashboard/orders", label: "Orders", value: snapshot.stats.orders, icon: Receipt },
    { href: "/dashboard", label: "Notifications", value: snapshot.stats.notifications, icon: Bell },
    { href: "/dashboard/certificates", label: "Certificates", value: snapshot.stats.certificates, icon: GraduationCap }
  ];

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Student dashboard</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">My learning</h1>
      <p className="mt-3 text-muted-foreground">Track your courses, batches, lessons, assignments, orders, downloads, and support.</p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="block">
            <Card className="h-full transition hover:bg-white/[0.1]">
              <CardHeader><card.icon className="h-6 w-6 text-accent" /><CardTitle>{card.value}</CardTitle><CardDescription>{card.label}</CardDescription></CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Continue learning</CardTitle>
            <CardDescription>Resume from your latest tracked lesson position.</CardDescription>
          </CardHeader>
          <div className="grid gap-3 p-6 pt-0">
            {snapshot.lessons.length ? snapshot.lessons.slice(0, 5).map((lesson) => {
              const course = firstRelation(lesson.courses);
              return (
                <Link key={lesson.id} href={`/dashboard/lessons/${lesson.id}`} className="grid gap-2 rounded-[1rem] border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]">
                  <div className="flex items-center justify-between gap-3"><span className="font-bold text-white">{lesson.title}</span><span className="text-xs text-accent">{lesson.last_position_seconds}s</span></div>
                  <p className="text-sm text-muted-foreground">{course?.title ?? "Course lesson"}</p>
                </Link>
              );
            }) : <Empty label="No lesson progress yet." />}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned batches</CardTitle>
            <CardDescription>You can belong to multiple batches without losing old access.</CardDescription>
          </CardHeader>
          <div className="grid gap-3 p-6 pt-0">
            {snapshot.batches.length ? snapshot.batches.slice(0, 5).map((userBatch) => {
              const batch = firstRelation(userBatch.batches);
              const course = firstRelation(userBatch.courses);
              return (
                <div key={userBatch.id} className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white"><CheckCircle2 className="h-4 w-4 text-accent" /> {batch?.title ?? "Assigned batch"}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{course?.title ?? "Course"} - {userBatch.status}</p>
                </div>
              );
            }) : <Empty label="No batch assignments yet." />}
          </div>
        </Card>
      </section>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">{label}</div>;
}
