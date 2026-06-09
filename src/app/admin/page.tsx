import { Activity, ShieldCheck, Users } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  { label: "Users", value: "0", icon: Users },
  { label: "Audit events", value: "0", icon: Activity },
  { label: "Roles protected", value: "Yes", icon: ShieldCheck }
];

export default function AdminPage() {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Admin dashboard</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Admin placeholder</h1>
      <p className="mt-3 text-muted-foreground">Admin operations, analytics, audit logs, and role management will be built here.</p>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader><card.icon className="h-6 w-6 text-accent" /><CardTitle>{card.value}</CardTitle><CardDescription>{card.label}</CardDescription></CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
