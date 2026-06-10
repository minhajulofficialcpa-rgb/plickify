import type { Metadata } from "next";
import { ShieldCheck, XCircle } from "lucide-react";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/public-data";
import { verifyCertificate } from "@/lib/verification-data";

export const metadata: Metadata = createMetadata({
  title: "Verify Certificate",
  description: "Check whether a Plickify certificate is valid and issued by the platform.",
  path: "/certificate/verify"
});

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function CertificateVerifyPage({ params }: PageProps) {
  const { code } = await params;
  const certificate = await verifyCertificate(code);
  const isValid = Boolean(certificate && !certificate.revoked_at);

  return (
    <main className="min-h-screen bg-background">
      <PublicHeader />
      <section className="mx-auto flex min-h-[72vh] max-w-4xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <Card className="w-full border-white/10 bg-card/80">
          <CardHeader className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
              {isValid ? <ShieldCheck className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
            </div>
            <CardTitle className="mt-4 text-3xl">{isValid ? "Certificate verified" : "Certificate not verified"}</CardTitle>
            <p className="text-sm text-muted-foreground">Verification code: {code}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {certificate ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_180px]">
                <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
                  <Info label="Certificate number" value={certificate.certificate_number} />
                  <Info label="Public code" value={certificate.certificate_code ?? certificate.verification_code} />
                  <Info label="Student" value={certificate.student_name ?? "Plickify learner"} />
                  <Info label="Course" value={certificate.course_title ?? "Plickify course"} />
                  <Info label="Issued" value={formatDate(certificate.issued_at)} />
                  <Info label="Status" value={isValid ? "valid" : "revoked"} />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                  {certificate.qr_code_url ? <img src={certificate.qr_code_url} alt="Certificate verification QR code" className="mx-auto h-32 w-32 rounded-xl bg-white p-2" /> : null}
                  <p className="mt-3 text-xs text-muted-foreground">Scan to verify this public certificate record.</p>
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-muted-foreground">
                We could not find an issued certificate for this code. Please check the code and try again.
              </p>
            )}
            <div className="flex justify-center">
              <Button asChild variant="accent"><a href="/contact">Need help?</a></Button>
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
