import { Receipt } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { getStudentOrders } from "@/lib/student-dashboard";
import { formatBdt, formatDate } from "@/lib/public-data";

export default async function DashboardOrdersPage() {
  const { user } = await requireOnboardedUser();
  const orders = await getStudentOrders(user.id);

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Orders</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Orders</h1>
      <p className="mt-3 text-muted-foreground">Course and product orders with payment status.</p>
      <section className="mt-8 grid gap-4">
        {orders.length ? orders.map((order) => (
          <Card key={order.id}><CardHeader><Receipt className="h-6 w-6 text-accent" /><CardTitle>{order.order_number ?? order.id.slice(0, 8)}</CardTitle><CardDescription>{formatBdt(order.total_bdt ?? 0)} - {order.status} - {order.payment_status ?? "payment pending"} - {formatDate(order.created_at)}</CardDescription></CardHeader></Card>
        )) : <Empty label="No orders yet." />}
      </section>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">{label}</div>;
}
