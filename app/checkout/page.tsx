import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CheckoutPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <Badge>PipraPay checkout</Badge>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.06em]">Collect local payments with clean reconciliation.</h1>
          <p className="mt-5 text-muted-foreground">The API route creates a PipraPay checkout session for bKash, Nagad, or Rocket and the webhook records the payment in Supabase.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Demo payment form</CardTitle><CardDescription>Connect this form to `/api/piprapay/create-payment` for production checkout.</CardDescription></CardHeader>
          <CardContent className="grid gap-4">
            <Input placeholder="Customer name" />
            <Input placeholder="Email" type="email" />
            <Input placeholder="Phone number" />
            <div className="grid gap-3 sm:grid-cols-3">{["bKash", "Nagad", "Rocket"].map((method) => <Button key={method} variant="secondary">{method}</Button>)}</div>
            <Button variant="accent">Pay securely</Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
