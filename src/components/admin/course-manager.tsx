import type * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
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

const textareaClass = "min-h-24 w-full rounded-lg border border-border bg-card/90 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10";
const selectClass = "h-11 w-full rounded-lg border border-border bg-card/90 px-4 text-sm text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
const statusOptions = ["draft", "published", "archived"];
const batchStatusOptions = ["draft", "enrolling", "active", "completed", "archived"];

export function CourseManager({ courses, batches, lessons }: CourseManagerProps) {
  const courseOptions = courses.map((course) => ({ label: course.title, value: course.id }));
  const batchOptions = [{ label: "All active batches", value: "" }, ...batches.map((batch) => ({ label: batch.title, value: batch.id }))];

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 xl:grid-cols-3">
        <CourseForm title="Create course" description="Publish, draft, archive, and feature courses on the homepage." submitLabel="Create course" />
        <BatchForm title="Create batch" description="Attach cohorts to courses without removing older student access." submitLabel="Create batch" courses={courseOptions} />
        <LessonForm title="Create lesson" description="Assign lessons to courses and optional batches, then order and lock them." submitLabel="Create lesson" courses={courseOptions} batches={batchOptions} />
      </section>

      <section className="grid gap-4">
        <h2 className="text-2xl font-black text-foreground">Courses</h2>
        {courses.length ? courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.slug} · {course.status}{course.is_featured ? " · featured" : ""}</CardDescription>
                </div>
                <DeleteForm action={deleteCourseAction} id={course.id} label="Delete course" />
              </div>
              <details className="group mt-4 rounded-lg border border-border bg-muted/30 p-4">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-foreground"><Pencil className="h-4 w-4 text-accent" /> Edit course</summary>
                <div className="mt-4"><CourseForm submitLabel="Save course" initial={course} compact /></div>
              </details>
            </CardHeader>
          </Card>
        )) : <EmptyState label="No courses yet. Create your first course above." />}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Batches</CardTitle><CardDescription>Edit cohort status, date, and seat capacity.</CardDescription></CardHeader>
          <div className="grid gap-3 p-6 pt-0">
            {batches.length ? batches.map((batch) => (
              <RecordPanel key={batch.id} title={batch.title} detail={`${batch.status} · ${batch.capacity ?? "open"} seats`}>
                <BatchForm submitLabel="Save batch" initial={batch} courses={courseOptions} compact />
                <DeleteForm action={deleteBatchAction} id={batch.id} label="Delete batch" />
              </RecordPanel>
            )) : <EmptyState label="No batches yet." />}
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Lessons</CardTitle><CardDescription>Edit lesson order, lock status, video, and batch assignment.</CardDescription></CardHeader>
          <div className="grid gap-3 p-6 pt-0">
            {lessons.length ? lessons.map((lesson) => (
              <RecordPanel key={lesson.id} title={`${lesson.position}. ${lesson.title}`} detail={`${lesson.status} · ${lesson.is_locked ? "locked" : "unlocked"}`}>
                <LessonForm submitLabel="Save lesson" initial={lesson} courses={courseOptions} batches={batchOptions} compact />
                <DeleteForm action={deleteLessonAction} id={lesson.id} label="Delete lesson" />
              </RecordPanel>
            )) : <EmptyState label="No lessons yet." />}
          </div>
        </Card>
      </section>
    </div>
  );
}

function CourseForm({ title, description, submitLabel, initial, compact = false }: { title?: string; description?: string; submitLabel: string; initial?: CourseSummary; compact?: boolean }) {
  const form = <form action={saveCourseFormAction} className="grid gap-4 md:grid-cols-2">
    {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
    <Field label="Title" name="title" placeholder="Digital Business Foundations" defaultValue={initial?.title ?? ""} />
    <Field label="Slug" name="slug" placeholder="digital-business-foundations" defaultValue={initial?.slug ?? ""} />
    <Field label="Price BDT" name="priceBdt" type="number" defaultValue={String(initial?.price_bdt ?? 0)} />
    <Field label="Thumbnail URL" name="thumbnailUrl" type="url" defaultValue="" />
    <div className="md:col-span-2"><Textarea label="Description" name="description" defaultValue={initial?.description ?? ""} /></div>
    <Select label="Status" name="status" options={statusOptions} defaultValue={initial?.status ?? "draft"} />
    <Check label="Feature on homepage" name="isFeatured" defaultChecked={Boolean(initial?.is_featured)} />
    <div className="md:col-span-2"><Button type="submit" variant="accent">{submitLabel}</Button></div>
  </form>;
  if (compact) return form;
  return <Card><CardHeader><CardTitle>{title}</CardTitle>{description ? <CardDescription>{description}</CardDescription> : null}</CardHeader><div className="px-6 pb-6">{form}</div></Card>;
}

function BatchForm({ title, description, submitLabel, courses, initial, compact = false }: { title?: string; description?: string; submitLabel: string; courses: Array<{ label: string; value: string }>; initial?: BatchSummary; compact?: boolean }) {
  const form = <form action={saveBatchFormAction} className="grid gap-4 md:grid-cols-2">
    {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
    <Select label="Course" name="courseId" options={courses} defaultValue={initial?.course_id ?? courses[0]?.value ?? ""} />
    <Field label="Title" name="title" placeholder="Weekend live cohort" defaultValue={initial?.title ?? ""} />
    <Select label="Status" name="status" options={batchStatusOptions} defaultValue={initial?.status ?? "draft"} />
    <Field label="Starts at" name="startsAt" type="datetime-local" defaultValue={toDateTimeLocal(initial?.starts_at)} />
    <Field label="Ends at" name="endsAt" type="datetime-local" defaultValue={toDateTimeLocal(initial?.ends_at)} />
    <Field label="Capacity" name="capacity" type="number" defaultValue={initial?.capacity ? String(initial.capacity) : ""} />
    <div className="md:col-span-2"><Button type="submit" variant="accent">{submitLabel}</Button></div>
  </form>;
  if (compact) return form;
  return <Card><CardHeader><CardTitle>{title}</CardTitle>{description ? <CardDescription>{description}</CardDescription> : null}</CardHeader><div className="px-6 pb-6">{form}</div></Card>;
}

function LessonForm({ title, description, submitLabel, courses, batches, initial, compact = false }: { title?: string; description?: string; submitLabel: string; courses: Array<{ label: string; value: string }>; batches: Array<{ label: string; value: string }>; initial?: LessonSummary; compact?: boolean }) {
  const form = <form action={saveLessonFormAction} className="grid gap-4 md:grid-cols-2">
    {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
    <Select label="Course" name="courseId" options={courses} defaultValue={initial?.course_id ?? courses[0]?.value ?? ""} />
    <Select label="Batch" name="batchId" options={batches} defaultValue={initial?.batch_id ?? ""} />
    <Field label="Title" name="title" defaultValue={initial?.title ?? ""} />
    <Field label="Order" name="position" type="number" defaultValue={String(initial?.position ?? 1)} />
    <Field label="Duration seconds" name="durationSeconds" type="number" defaultValue={String(initial?.duration_seconds ?? 0)} />
    <Field label="YouTube video ID" name="youtubeVideoId" defaultValue="" />
    <Field label="Video URL" name="videoUrl" type="url" defaultValue="" />
    <Select label="Status" name="status" options={statusOptions} defaultValue={initial?.status ?? "draft"} />
    <div className="md:col-span-2"><Textarea label="Description" name="description" defaultValue={initial?.description ?? ""} /></div>
    <div className="md:col-span-2"><Textarea label="Lesson notes" name="content" defaultValue="" /></div>
    <Check label="Preview" name="isPreview" defaultChecked={Boolean(initial?.is_preview)} />
    <Check label="Locked" name="isLocked" defaultChecked={Boolean(initial?.is_locked)} />
    <div className="md:col-span-2"><Button type="submit" variant="accent">{submitLabel}</Button></div>
  </form>;
  if (compact) return form;
  return <Card><CardHeader><CardTitle>{title}</CardTitle>{description ? <CardDescription>{description}</CardDescription> : null}</CardHeader><div className="px-6 pb-6">{form}</div></Card>;
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <div className="grid gap-2"><Label htmlFor={props.name}>{label}</Label><Input id={props.name} {...props} /></div>;
}

function Textarea({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><textarea id={name} name={name} defaultValue={defaultValue} className={textareaClass} /></div>;
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: Array<string | { label: string; value: string }>; defaultValue?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} className={selectClass} required defaultValue={defaultValue}>
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return <option key={`${name}-${value || "empty"}`} value={value}>{optionLabel}</option>;
        })}
      </select>
    </div>
  );
}

function Check({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return <label className="flex items-center gap-2 rounded-lg border border-border bg-card/70 px-3 py-2 text-sm font-semibold text-foreground"><input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 rounded border-border bg-card accent-teal-600" /> {label}</label>;
}

function DeleteForm({ action, id, label }: { action: (formData: FormData) => Promise<void>; id: string; label: string }) {
  return <form action={action}><input type="hidden" name="id" value={id} /><Button type="submit" variant="ghost" size="sm"><Trash2 className="h-4 w-4" /> {label}</Button></form>;
}

function RecordPanel({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <details className="rounded-lg border border-border bg-card/80 p-4 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span><span className="block font-bold text-foreground">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{detail}</span></span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-accent"><Pencil className="h-3.5 w-3.5" /> Edit</span>
      </summary>
      <div className="mt-4 grid gap-4 border-t border-border pt-4">{children}</div>
    </details>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-lg border border-dashed border-border bg-card/70 p-6 text-sm text-muted-foreground">{label}</div>;
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}
