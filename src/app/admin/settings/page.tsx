import { saveHomeHeroAction } from "@/actions/home-settings";
import { ActionButton, AdminPageHeader, AdminSection, AdminTable, Field, StatusBadge, Textarea } from "@/components/admin/admin-resource-page";
import { getAdminSettings } from "@/lib/admin-dashboard";
import { homeSectionSettings, publicNavItems } from "@/lib/home-content";
import { getHomeHeroContent } from "@/lib/home-settings";

interface SettingRow { id: string; key: string; value: string; status: string }
interface HomeSectionRow { id: string; section: string; status: string; editable: string }
interface NavRow { id: string; label: string; href: string; status: string }

export default async function AdminSettingsPage() {
  const [settings, hero] = await Promise.all([getAdminSettings(), getHomeHeroContent()]);
  const rows: SettingRow[] = [
    { id: "site-url", key: "NEXT_PUBLIC_SITE_URL", value: settings.siteUrl, status: "configured" },
    { id: "downloads-bucket", key: "SUPABASE_DOWNLOADS_BUCKET", value: settings.downloadsBucket, status: "configured" },
    { id: "supabase-url", key: "NEXT_PUBLIC_SUPABASE_URL", value: settings.hasSupabaseUrl ? "set" : "missing", status: settings.hasSupabaseUrl ? "configured" : "missing" },
    { id: "service-role", key: "SUPABASE_SERVICE_ROLE_KEY", value: settings.hasServiceRole ? "set" : "missing", status: settings.hasServiceRole ? "configured" : "missing" }
  ];
  const homeSections: HomeSectionRow[] = Object.entries(homeSectionSettings).map(([id, section]) => ({ id, section: section.label, status: section.enabled ? "enabled" : "disabled", editable: section.editableFields.join(", ") }));
  const navRows: NavRow[] = publicNavItems.map((item) => ({ id: item.id, label: item.label, href: item.href, status: item.enabled ? "enabled" : "disabled" }));
  const [statOne, statTwo, statThree] = hero.stats;

  return (
    <div>
      <AdminPageHeader eyebrow="Admin" title="Settings" description="Operational configuration and homepage content controls." />
      <div className="mt-8 grid gap-8">
        <AdminSection title="Homepage hero editor" description="Update the first section of the homepage. Changes publish after save.">
          <form action={saveHomeHeroAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Eyebrow" name="eyebrow" defaultValue={hero.eyebrow} />
            <Field label="Hero image URL" name="imageUrl" type="url" defaultValue={hero.imageUrl} />
            <div className="md:col-span-2"><Field label="Title" name="title" defaultValue={hero.title} /></div>
            <div className="md:col-span-2"><Textarea label="Description" name="description" defaultValue={hero.description} /></div>
            <Field label="Primary button label" name="primaryCtaLabel" defaultValue={hero.primaryCta.label} />
            <Field label="Primary button URL" name="primaryCtaHref" defaultValue={hero.primaryCta.href} />
            <Field label="Secondary button label" name="secondaryCtaLabel" defaultValue={hero.secondaryCta.label} />
            <Field label="Secondary button URL" name="secondaryCtaHref" defaultValue={hero.secondaryCta.href} />
            <Field label="Stat 1 label" name="statOneLabel" defaultValue={statOne?.label ?? ""} />
            <Field label="Stat 1 value" name="statOneValue" defaultValue={statOne?.value ?? ""} />
            <Field label="Stat 2 label" name="statTwoLabel" defaultValue={statTwo?.label ?? ""} />
            <Field label="Stat 2 value" name="statTwoValue" defaultValue={statTwo?.value ?? ""} />
            <Field label="Stat 3 label" name="statThreeLabel" defaultValue={statThree?.label ?? ""} />
            <Field label="Stat 3 value" name="statThreeValue" defaultValue={statThree?.value ?? ""} />
            <div className="md:col-span-2"><ActionButton>Save hero section</ActionButton></div>
          </form>
        </AdminSection>
        <AdminSection title="Environment">
          <AdminTable rows={rows} emptyLabel="No settings found." columns={[{ header: "Key", cell: (row) => <p className="font-bold text-foreground">{row.key}</p> }, { header: "Value", cell: (row) => row.value }, { header: "Status", cell: (row) => <StatusBadge value={row.status} /> }]} />
        </AdminSection>
        <AdminSection title="Homepage sections">
          <AdminTable rows={homeSections} emptyLabel="No homepage sections configured." columns={[{ header: "Section", cell: (row) => <p className="font-bold text-foreground">{row.section}</p> }, { header: "Editable content", cell: (row) => row.editable }, { header: "Status", cell: (row) => <StatusBadge value={row.status} /> }]} />
        </AdminSection>
        <AdminSection title="Public navigation">
          <AdminTable rows={navRows} emptyLabel="No nav links configured." columns={[{ header: "Label", cell: (row) => <p className="font-bold text-foreground">{row.label}</p> }, { header: "URL", cell: (row) => row.href }, { header: "Status", cell: (row) => <StatusBadge value={row.status} /> }]} />
        </AdminSection>
      </div>
    </div>
  );
}
