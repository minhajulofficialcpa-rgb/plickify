export type UserRole = "student" | "support_moderator" | "content_manager" | "admin" | "super_admin";

export const roleRank: Record<UserRole, number> = {
  student: 10,
  support_moderator: 20,
  content_manager: 30,
  admin: 40,
  super_admin: 50
};

export const adminRoles: UserRole[] = ["admin", "super_admin"];
export const staffRoles: UserRole[] = ["support_moderator", "content_manager", "admin", "super_admin"];

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && role in roleRank;
}

export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole) {
  if (!userRole) return false;
  return roleRank[userRole] >= roleRank[requiredRole];
}

export function canAccessAdmin(userRole: UserRole | undefined) {
  return Boolean(userRole && staffRoles.includes(userRole));
}

export function canManageContent(userRole: UserRole | undefined) {
  return hasRole(userRole, "content_manager");
}

export function canModerateSupport(userRole: UserRole | undefined) {
  return hasRole(userRole, "support_moderator");
}

export function canManageRoles(userRole: UserRole | undefined) {
  return userRole === "super_admin";
}

export function canManagePayments(userRole: UserRole | undefined) {
  return userRole === "admin" || userRole === "super_admin";
}
