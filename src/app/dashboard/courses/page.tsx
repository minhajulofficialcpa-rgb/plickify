import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { firstRelation } from "@/lib/lms";
import { getStudentCourses, getStudentLessonProgress } from "@/lib/student-dashboard";

export default async function DashboardCoursesPage() {
  const { user } = await requireOnboardedUser();
  const [courses, progress] = await Promise.all([getStudentCourses(user.id), getStudentLessonProgress(user.id)]);

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Courses</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Enrolled courses</h1>
      <p className="mt-3 text-muted-foreground">Active enrollments unlock protected lessons and smart resume tracking.</p>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader><CardTitle>My courses</CardTitle><CardDescription>Open a course to see accessible lessons.</CardDescription></CardHeader>
          <div className="grid gap-3 p-6 pt-0">
            {courses.length ? courses.map((enrollment) => {
              const course = firstRelation(enrollment.courses);
              return (
                <Link key={enrollment.id} href={course ? `/dashboard/courses/${course.id}` : "/dashboard/courses"} className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]">
                  <div className="flex items-center justify-between gap-3"><span className="font-bold text-white">{course?.title ?? "Course access"}</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-muted-foreground">{enrollment.status}</span></div>
                  <p className="mt-2 text-sm text-muted-foreground">{course?.description ?? "Course details will appear when published."}</p>
                </Link>
              );
            }) : <Empty label="No enrolled courses yet." />}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lesson progress</CardTitle><CardDescription>Recent progress from heartbeat analytics.</CardDescription></CardHeader>
          <div className="grid gap-3 p-6 pt-0">
            {progress.length ? progress.map((lesson) => (
              <Link key={lesson.id} href={`/dashboard/lessons/${lesson.id}`} className="flex items-center justify-between gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]">
                <span className="flex items-center gap-2 text-sm font-bold text-white"><PlayCircle className="h-4 w-4 text-accent" /> {lesson.title}</span>
                <span className="text-xs text-muted-foreground">{lesson.last_position_seconds}s</span>
              </Link>
            )) : <Empty label="No lesson progress yet." />}
          </div>
        </Card>
      </section>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">{label}</div>;
}
