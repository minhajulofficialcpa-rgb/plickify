import Link from "next/link";
import type { Route } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-resource-page";
import { getAdminAnalytics } from "@/lib/admin-dashboard";

const areas: Array<{ href: Route; label: string; detail: string }> = [
  { href: "/admin/users", label: "Manage users", detail: "Lock profiles and grant staff roles." },
  { href: "/admin/courses", label: "Courses", detail: "Create, update, feature, and delete courses." },
  { href: "/admin/batches", label: "Batches", detail: "Review cohorts and access windows." },
  { href: "/admin/lessons", label: "Lessons", detail: "Audit lesson order, locks, and publishing state." },
  { href: "/admin/products", label: "Products", detail: "CRUD digital products and delivery metadata." },
  { href: "/admin/enrollments", label: "Enrollments", detail: "Approve pending requests and grant free access." },
  { href: "/admin/payments", label: "Payments", detail: "View PipraPay payments and webhook logs." },
  { href: "/admin/audit-logs", label: "Audit logs", detail: "Super admin-only sensitive action trail." }
];

export default async function AdminPage() {
  const metrics = await getAdminAnalytics();
  return <div><AdminPageHeader eyebrow="Admin dashboard" title="Admin operations" description="Manage LMS content, shop records, users, enrollments, payments, support, certificates, reviews, and audit trails." /><section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{metrics.length ? metrics.map((metric) => <Card key={metric.label}><CardHeader><CardTitle>{metric.value}</CardTitle><CardDescription>{metric.label} - {metric.detail}</CardDescription></CardHeader></Card>) : <Card><CardHeader><CardTitle>Admin env required</CardTitle><CardDescription>Set Supabase service-role environment variables to load analytics.</CardDescription></CardHeader></Card>}</section><section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{areas.map((area) => <Link key={area.href} href={area.href} className="rounded-[1rem] border border-white/10 bg-white/[0.05] p-5 transition hover:bg-white/[0.09]"><span className="text-lg font-bold text-white">{area.label}</span><span className="mt-1 block text-sm text-muted-foreground">{area.detail}</span></Link>)}</section></div>;
}
