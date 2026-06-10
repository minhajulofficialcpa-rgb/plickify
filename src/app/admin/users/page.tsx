import { grantRoleAction, updateUserLockAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, AdminSection, AdminTable, HiddenId, Select, StatusBadge } from "@/components/admin/admin-resource-page";
import { firstAdminRelation, getAdminUsers } from "@/lib/admin-dashboard";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  return <div><AdminPageHeader eyebrow="Admin" title="Users" description="Manage users, locked profiles, and super-admin role grants." /><div className="mt-8"><AdminSection title="User directory"><AdminTable rows={users} emptyLabel="No users found." columns={[{ header: "User", cell: (row) => <div><p className="font-bold text-white">{row.full_name ?? "Unnamed"}</p><p>{row.email ?? row.id}</p><p>{row.phone_number ?? "No phone"}</p></div> }, { header: "Onboarding", cell: (row) => <StatusBadge value={row.onboarding_completed ? "complete" : "pending"} /> }, { header: "Lock", cell: (row) => <form action={updateUserLockAction} className="flex items-center gap-2"><HiddenId id={row.id} /><input type="hidden" name="isLocked" value={row.is_locked ? "false" : "true"} /><Button type="submit" size="sm" variant="secondary">{row.is_locked ? "Unlock" : "Lock"}</Button></form> }, { header: "Role", cell: (row) => firstAdminRelation(row.admin_roles)?.role ?? "student" }, { header: "Grant role", cell: (row) => <form action={grantRoleAction} className="grid gap-2"><input type="hidden" name="userId" value={row.id} /><Select label="Role" name="role" options={["support_moderator", "content_manager", "admin", "super_admin"]} /><Button type="submit" size="sm" variant="accent">Grant</Button></form> }]} /></AdminSection></div></div>;
}
