import type { Metadata } from "next";
import { ShieldCheck, XCircle } from "lucide-react";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBdt, formatDate, verifyInvoice } from "@/lib/public-data";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Verify Invoice",
  description: "Check whether a Plickify invoice is valid and issued by the platform.",
  path: "/invoice/verify"
});

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function InvoiceVerifyPage({ params }: PageProps) {
  const { code } = await params;
  const invoice = await verifyInvoice(code);
  const isVerified = Boolean(invoice);

  return (
    <main className="min-h-screen bg-background">
      <PublicHeader />
      <section className="mx-auto flex min-h-[72vh] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <Card className="w-full border-white/10 bg-card/80">
          <CardHeader className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent">
              {isVerified ? <ShieldCheck className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
            </div>
            <CardTitle className="mt-4 text-3xl">{isVerified ? "Invoice verified" : "Invoice not found"}</CardTitle>
            <p className="text-sm text-muted-foreground">Invoice code: {code}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {invoice ? (
              <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
                <Info label="Invoice number" value={invoice.invoice_number} />
                <Info label="Amount" value={formatBdt(invoice.amount_bdt)} />
                <Info label="Paid" value={formatDate(invoice.paid_at)} />
                <Info label="Currency" value={invoice.currency} />
                <Info label="Status" value={invoice.status} />
                <Info label="Record" value="Authentic Plickify invoice" />
              </div>
            ) : (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-muted-foreground">
                This invoice code is not currently associated with a Plickify invoice record.
              </p>
            )}
            <div className="flex justify-center">
              <Button asChild variant="accent"><a href="/contact">Contact support</a></Button>
            </div>
          </CardContent>
        </Card>
      </section>
      <PublicFooter />
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
