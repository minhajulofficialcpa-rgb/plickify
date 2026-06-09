import { QrCode, ShieldCheck } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CertificateVerifyPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <Badge>Phase 11 · Certificate, invoice and QR verification</Badge>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.06em]">Verify certificates by QR or certificate number.</h1>
          <p className="mt-5 text-muted-foreground">
            Certificates are stored privately, linked to learners and courses, and exposed through a verification-safe lookup flow.
          </p>
        </div>
        <Card>
          <CardHeader>
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent"><QrCode className="h-7 w-7" /></div>
            <CardTitle>Certificate lookup</CardTitle>
            <CardDescription>Scan a QR code or enter a certificate number from a Plickify PDF.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input placeholder="PLK-CERT-2026-0001" />
            <Button variant="accent">Verify certificate</Button>
            <p className="flex items-center gap-2 text-sm text-accent"><ShieldCheck className="h-4 w-4" /> Verification returns only public-safe certificate metadata.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
