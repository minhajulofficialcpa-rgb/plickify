import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { getAccessibleCourseLessons } from "@/lib/lms";

interface CourseLessonsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseLessonsPage({ params }: CourseLessonsPageProps) {
  const { courseId } = await params;
  const { user } = await requireOnboardedUser();
  const access = await getAccessibleCourseLessons(user.id, courseId);
  if (!access) notFound();

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Course lessons</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">{access.course.title}</h1>
      <p className="mt-3 text-muted-foreground">Lessons are checked on the server before the player is rendered.</p>

      <section className="mt-8 grid gap-3">
        {access.lessons.length ? access.lessons.map((lesson) => (
          <Link key={lesson.id} href={`/dashboard/lessons/${lesson.id}`} className="grid gap-3 rounded-[1rem] border border-white/10 bg-white/[0.05] p-5 transition hover:bg-white/[0.09] md:grid-cols-[4rem_1fr_auto] md:items-center">
            <span className="text-sm font-black text-accent">{lesson.position.toString().padStart(2, "0")}</span>
            <div>
              <h2 className="font-bold text-white">{lesson.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{lesson.description ?? "Protected lesson"}</p>
            </div>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              {lesson.is_locked ? <Lock className="h-4 w-4" /> : <PlayCircle className="h-4 w-4 text-accent" />}
              {Math.round(lesson.duration_seconds / 60)} min
            </span>
          </Link>
        )) : (
          <Card><CardHeader><CardTitle>No lessons yet</CardTitle><CardDescription>This course has no published lessons available for your batch yet.</CardDescription></CardHeader></Card>
        )}
      </section>
    </div>
  );
}
