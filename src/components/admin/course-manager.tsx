import type * as React from "react";
import { Trash2 } from "lucide-react";
import {
  deleteBatchAction,
  deleteCourseAction,
  deleteLessonAction,
  saveBatchFormAction,
  saveCourseFormAction,
  saveLessonFormAction
} from "@/actions/lms";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BatchSummary, CourseSummary, LessonSummary } from "@/lib/lms";

interface CourseManagerProps {
  courses: CourseSummary[];
  batches: BatchSummary[];
  lessons: LessonSummary[];
}

const fieldClass = "min-h-24 w-full rounded-[1rem] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10";
const selectClass = "h-11 w-full rounded-full border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";

export function CourseManager({ courses, batches, lessons }: CourseManagerProps) {
  return (
    <div className="grid gap-8">
      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Create course</CardTitle><CardDescription>Publish, draft, archive, and feature courses on the homepage.</CardDescription></CardHeader>
          <form action={saveCourseFormAction} className="grid gap-4 px-6 pb-6">
            <Field label="Title" name="title" placeholder="Digital Business Foundations" />
            <Field label="Slug" name="slug" placeholder="digital-business-foundations" />
            <Field label="Price BDT" name="priceBdt" type="number" defaultValue="0" />
            <Textarea label="Description" name="description" />
            <Field label="Thumbnail URL" name="thumbnailUrl" type="url" />
            <Select label="Status" name="status" options={["draft", "published", "archived"]} />
            <Check label="Feature on homepage" name="isFeatured" />
            <Button type="submit" variant="accent">Create course</Button>
          </form>
        </Card>

        <Card>
          <CardHeader><CardTitle>Create batch</CardTitle><CardDescription>Attach cohorts to courses without removing older student access.</CardDescription></CardHeader>
          <form action={saveBatchFormAction} className="grid gap-4 px-6 pb-6">
            <Select label="Course" name="courseId" options={courses.map((course) => ({ label: course.title, value: course.id }))} />
            <Field label="Title" name="title" placeholder="Weekend live cohort" />
            <Select label="Status" name="status" options={["draft", "enrolling", "active", "completed", "archived"]} />
            <Field label="Starts at" name="startsAt" type="datetime-local" />
            <Field label="Ends at" name="endsAt" type="datetime-local" />
            <Field label="Capacity" name="capacity" type="number" />
            <Button type="submit" variant="accent">Create batch</Button>
          </form>
        </Card>

        <Card>
          <CardHeader><CardTitle>Create lesson</CardTitle><CardDescription>Assign lessons to courses and optional batches, then order and lock them.</CardDescription></CardHeader>
          <form action={saveLessonFormAction} className="grid gap-4 px-6 pb-6">
            <Select label="Course" name="courseId" options={courses.map((course) => ({ label: course.title, value: course.id }))} />
            <Select label="Batch" name="batchId" options={[{ label: "All active batches", value: "" }, ...batches.map((batch) => ({ label: batch.title, value: batch.id }))]} />
            <Field label="Title" name="title" />
            <Field label="Order" name="position" type="number" defaultValue="1" />
            <Field label="Duration seconds" name="durationSeconds" type="number" defaultValue="0" />
            <Field label="YouTube video ID" name="youtubeVideoId" />
            <Field label="Video URL" name="videoUrl" type="url" />
            <Textarea label="Description" name="description" />
            <Textarea label="Lesson notes" name="content" />
            <Select label="Status" name="status" options={["draft", "published", "archived"]} />
            <div className="grid gap-2 sm:grid-cols-2"><Check label="Preview" name="isPreview" /><Check label="Locked" name="isLocked" /></div>
            <Button type="submit" variant="accent">Create lesson</Button>
          </form>
        </Card>
      </section>

      <section className="grid gap-4">
        <h2 className="text-2xl font-black text-white">Courses</h2>
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><CardTitle>{course.title}</CardTitle><CardDescription>{course.slug} · {course.status}{course.is_featured ? " · featured" : ""}</CardDescription></div>
                <form action={deleteCourseAction}><input type="hidden" name="id" value={course.id} /><IconDelete label="Delete course" /></form>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Batches</CardTitle><CardDescription>Create as many batches as needed; old assignments remain separate.</CardDescription></CardHeader>
          <div className="grid gap-3 p-6 pt-0">
            {batches.map((batch) => <Row key={batch.id} title={batch.title} detail={`${batch.status} · ${batch.capacity ?? "open"} seats`} action={deleteBatchAction} id={batch.id} />)}
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Lessons</CardTitle><CardDescription>Lesson order, batch assignment, and lock status are enforced on server reads.</CardDescription></CardHeader>
          <div className="grid gap-3 p-6 pt-0">
            {lessons.map((lesson) => <Row key={lesson.id} title={`${lesson.position}. ${lesson.title}`} detail={`${lesson.status} · ${lesson.is_locked ? "locked" : "unlocked"}`} action={deleteLessonAction} id={lesson.id} />)}
          </div>
        </Card>
      </section>
    </div>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <div className="grid gap-2"><Label htmlFor={props.name}>{label}</Label><Input id={props.name} {...props} /></div>;
}

function Textarea({ label, name }: { label: string; name: string }) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><textarea id={name} name={name} className={fieldClass} /></div>;
}

function Select({ label, name, options }: { label: string; name: string; options: Array<string | { label: string; value: string }> }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} className={selectClass} required>
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return <option key={`${name}-${value || "empty"}`} value={value}>{optionLabel}</option>;
        })}
      </select>
    </div>
  );
}

function Check({ label, name }: { label: string; name: string }) {
  return <label className="flex items-center gap-2 text-sm font-semibold text-white"><input type="checkbox" name={name} className="h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-400" /> {label}</label>;
}

function IconDelete({ label }: { label: string }) {
  return <Button type="submit" variant="ghost" size="sm" aria-label={label}><Trash2 className="h-4 w-4" /></Button>;
}

function Row({ title, detail, action, id }: { title: string; detail: string; action: (formData: FormData) => Promise<void>; id: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
      <div><p className="font-bold text-white">{title}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>
      <form action={action}><input type="hidden" name="id" value={id} /><IconDelete label={`Delete ${title}`} /></form>
    </div>
  );
}
