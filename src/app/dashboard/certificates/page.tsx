import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { firstRelation } from "@/lib/lms";
import { getStudentCertificates } from "@/lib/student-dashboard";
import { formatDate } from "@/lib/public-data";

export default async function DashboardCertificatesPage() {
  const { user } = await requireOnboardedUser();
  const certificates = await getStudentCertificates(user.id);

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Certificates</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Certificates</h1>
      <p className="mt-3 text-muted-foreground">Issued certificates with public verification links.</p>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {certificates.length ? certificates.map((certificate) => {
          const course = firstRelation(certificate.courses);
          return (
            <Card key={certificate.id}>
              <CardHeader><GraduationCap className="h-6 w-6 text-accent" /><CardTitle>{certificate.certificate_number}</CardTitle><CardDescription>{course?.title ?? "Course certificate"} - issued {formatDate(certificate.issued_at)}</CardDescription></CardHeader>
              <div className="px-6 pb-6"><Link href={`/certificate/verify/${certificate.verification_code}`} className="text-sm font-semibold text-accent">Verify certificate</Link></div>
            </Card>
          );
        }) : <Empty label="No certificates yet." />}
      </section>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">{label}</div>;
}
