import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  { label: "Active courses", value: "0", icon: BookOpen },
  { label: "Completed lessons", value: "0", icon: CheckCircle2 },
  { label: "Pending tasks", value: "0", icon: Clock }
];

export default function DashboardPage() {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Student dashboard</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Dashboard placeholder</h1>
      <p className="mt-3 text-muted-foreground">Student learning, purchases, certificates, and support modules will be built here.</p>
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
