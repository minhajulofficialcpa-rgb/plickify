import { AdminPageHeader, AdminSection, AdminTable, StatusBadge } from "@/components/admin/admin-resource-page";
import { getAdminSettings } from "@/lib/admin-dashboard";

interface SettingRow { id: string; key: string; value: string; status: string }

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  const rows: SettingRow[] = [
    { id: "site-url", key: "NEXT_PUBLIC_SITE_URL", value: settings.siteUrl, status: "configured" },
    { id: "downloads-bucket", key: "SUPABASE_DOWNLOADS_BUCKET", value: settings.downloadsBucket, status: "configured" },
    { id: "supabase-url", key: "NEXT_PUBLIC_SUPABASE_URL", value: settings.hasSupabaseUrl ? "set" : "missing", status: settings.hasSupabaseUrl ? "configured" : "missing" },
    { id: "service-role", key: "SUPABASE_SERVICE_ROLE_KEY", value: settings.hasServiceRole ? "set" : "missing", status: settings.hasServiceRole ? "configured" : "missing" }
  ];
  return <div><AdminPageHeader eyebrow="Admin" title="Settings" description="Operational configuration status for admin features." /><div className="mt-8"><AdminSection title="Environment"><AdminTable rows={rows} emptyLabel="No settings found." columns={[{ header: "Key", cell: (row) => <p className="font-bold text-white">{row.key}</p> }, { header: "Value", cell: (row) => row.value }, { header: "Status", cell: (row) => <StatusBadge value={row.status} /> }]} /></AdminSection></div></div>;
}
