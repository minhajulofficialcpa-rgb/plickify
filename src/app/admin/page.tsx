import Link from "next/link";
import { Activity, BookOpen, ShieldCheck, Users } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  { label: "Users", value: "0", icon: Users },
  { label: "Content tools", value: "Ready", icon: BookOpen },
  { label: "Audit events", value: "0", icon: Activity },
  { label: "Roles protected", value: "Yes", icon: ShieldCheck }
];

export default function AdminPage() {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Admin dashboard</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Admin operations</h1>
      <p className="mt-3 text-muted-foreground">Manage content, analytics, audit logs, and protected role workflows.</p>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader><card.icon className="h-6 w-6 text-accent" /><CardTitle>{card.value}</CardTitle><CardDescription>{card.label}</CardDescription></CardHeader>
          </Card>
        ))}
      </section>
      <Link href="/admin/courses" className="mt-8 block rounded-[1rem] border border-white/10 bg-white/[0.05] p-5 transition hover:bg-white/[0.09]">
        <span className="text-lg font-bold text-white">Course, batch, lesson manager</span>
        <span className="mt-1 block text-sm text-muted-foreground">Create and update course access content.</span>
      </Link>
    </div>
  );
}
