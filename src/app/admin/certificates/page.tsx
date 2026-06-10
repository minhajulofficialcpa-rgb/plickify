import { issueCertificateAction, revokeCertificateAction } from "@/actions/certificates";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, AdminSection, AdminTable, Field, HiddenId, StatusBadge } from "@/components/admin/admin-resource-page";
import { firstRelation, getAdminVerificationCertificates } from "@/lib/admin-verification";

export default async function AdminCertificatesPage() {
  const certificates = await getAdminVerificationCertificates();

  return (
    <div>
      <AdminPageHeader eyebrow="Learning" title="Certificates" description="Issue certificates after eligibility checks, or manually override when an admin needs to resolve an exception." />
      <div className="mt-8 grid gap-6">
        <AdminSection title="Issue certificate" description="Automatic issuing requires 100 percent course progress and completed required assignments. Manual override is audited.">
          <form action={issueCertificateAction} className="grid gap-4 md:grid-cols-2">
            <Field label="User ID" name="userId" required />
            <Field label="Course ID" name="courseId" required />
            <Field label="Manual reason" name="manualReason" placeholder="Optional override reason" />
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
              <input name="manualOverride" type="checkbox" className="h-4 w-4 accent-primary" />
              Manual override
            </label>
            <Button type="submit" variant="accent">Issue certificate</Button>
          </form>
        </AdminSection>
        <AdminSection title="Certificates">
          <AdminTable
            rows={certificates}
            emptyLabel="No certificates found."
            columns={[
              { header: "Certificate", cell: (row) => <div><p className="font-bold text-white">{row.certificate_number}</p><p>{row.certificate_code ?? row.verification_code}</p>{row.certificate_url ? <a className="text-accent" href={row.certificate_url}>Verify page</a> : null}</div> },
              { header: "Student", cell: (row) => firstRelation(row.profiles)?.email ?? row.user_id },
              { header: "Course", cell: (row) => firstRelation(row.courses)?.title ?? row.course_id ?? "-" },
              { header: "Eligibility", cell: (row) => <div><p>{Number(row.progress_percent ?? 0)}% progress</p><p>{row.assignment_criteria_completed ? "Assignments complete" : "Assignments pending"}</p></div> },
              { header: "Source", cell: (row) => <StatusBadge value={row.issue_source ?? "automatic"} /> },
              { header: "Status", cell: (row) => <StatusBadge value={row.revoked_at ? "revoked" : "issued"} /> },
              { header: "Action", cell: (row) => row.revoked_at ? "Revoked" : <form action={revokeCertificateAction}><HiddenId id={row.id} /><Button type="submit" size="sm" variant="secondary">Revoke</Button></form> }
            ]}
          />
        </AdminSection>
      </div>
    </div>
  );
}
