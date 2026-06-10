import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonPlayer } from "@/components/player/lesson-player";
import { firstRelation, getYouTubeEmbedUrl, requireLessonAccess } from "@/lib/lms";

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const access = await requireLessonAccess(lessonId);
  const course = firstRelation(access.lesson.courses);
  const batch = firstRelation(access.lesson.batches);
  const watermark = `${access.lesson.id.slice(0, 8)} · ${course?.title ?? "Plickify"}`;

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Protected lesson</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">{access.lesson.title}</h1>
        <p className="mt-3 text-muted-foreground">{course?.title ?? "Course"}{batch ? ` · ${batch.title}` : ""}</p>
      </div>

      <LessonPlayer
        lessonId={access.lesson.id}
        title={access.lesson.title}
        embedUrl={getYouTubeEmbedUrl(access.lesson)}
        initialPositionSeconds={access.progress.last_position_seconds}
        durationSeconds={access.lesson.duration_seconds}
        watermark={watermark}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lesson notes</CardTitle>
          <CardDescription>{access.lesson.description ?? "No notes have been added yet."}</CardDescription>
        </CardHeader>
        {access.lesson.content ? <div className="whitespace-pre-wrap px-6 pb-6 text-sm leading-7 text-muted-foreground">{access.lesson.content}</div> : null}
      </Card>
    </div>
  );
}
