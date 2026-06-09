import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, detail }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
          <p className="mt-2 text-xs text-accent">{detail}</p>
        </div>
        <div className="rounded-2xl bg-accent/10 p-3 text-accent">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
