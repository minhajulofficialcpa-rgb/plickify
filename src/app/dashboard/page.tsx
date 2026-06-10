import Link from "next/link";
import { BookOpen, CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { firstRelation, getStudentLearningHome } from "@/lib/lms";

export default async function DashboardPage() {
  const { user } = await requireOnboardedUser();
  const { enrollments, userBatches } = await getStudentLearningHome(user.id);
  const activeEnrollments = enrollments.filter((item) => item.status === "active");

  const cards = [
    { label: "Active courses", value: activeEnrollments.length.toString(), icon: BookOpen },
    { label: "Assigned batches", value: userBatches.length.toString(), icon: CalendarDays },
    { label: "Pending enrollments", value: enrollments.filter((item) => item.status === "pending").length.toString(), icon: Clock }
  ];

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Student dashboard</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">My learning</h1>
      <p className="mt-3 text-muted-foreground">Your enrolled courses, assigned batches, and protected lessons live here.</p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader><card.icon className="h-6 w-6 text-accent" /><CardTitle>{card.value}</CardTitle><CardDescription>{card.label}</CardDescription></CardHeader>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Enrolled courses</CardTitle>
            <CardDescription>Open a course to continue lessons you have access to.</CardDescription>
          </CardHeader>
          <div className="grid gap-3 p-6 pt-0">
            {enrollments.length ? enrollments.map((enrollment) => {
              const course = firstRelation(enrollment.courses);
              return (
                <Link key={enrollment.id} href={course ? `/dashboard/courses/${course.id}` : "/dashboard"} className="grid gap-2 rounded-[1rem] border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-white">{course?.title ?? "Course access"}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">{enrollment.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{course?.description ?? "Course details will appear when the catalog record is available."}</p>
                </Link>
              );
            }) : (
              <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">No enrollments yet.</div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned batches</CardTitle>
            <CardDescription>Students can keep access to multiple batches over time.</CardDescription>
          </CardHeader>
          <div className="grid gap-3 p-6 pt-0">
            {userBatches.length ? userBatches.map((userBatch) => {
              const batch = firstRelation(userBatch.batches);
              const course = firstRelation(userBatch.courses);
              return (
                <div key={userBatch.id} className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white"><CheckCircle2 className="h-4 w-4 text-accent" /> {batch?.title ?? "Assigned batch"}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{course?.title ?? "Course"} · {userBatch.status}</p>
                </div>
              );
            }) : (
              <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">No batch assignments yet.</div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
