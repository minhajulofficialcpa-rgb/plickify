import { CourseManager } from "@/components/admin/course-manager";
import { requireContentManager } from "@/lib/lms";
import { getAdminContentOverview, hasSupabaseAdminEnv } from "@/lib/lms";

export default async function AdminCoursesPage() {
  await requireContentManager();

  if (!hasSupabaseAdminEnv()) {
    return (
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Content manager</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Course access system</h1>
        <p className="mt-3 text-muted-foreground">Supabase admin environment variables are required before content can be managed.</p>
      </div>
    );
  }

  const content = await getAdminContentOverview();

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Content manager</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Course access system</h1>
      <p className="mt-3 text-muted-foreground">Manage courses, batches, lessons, locks, ordering, and featured homepage content.</p>
      <div className="mt-8"><CourseManager {...content} /></div>
    </div>
  );
}
