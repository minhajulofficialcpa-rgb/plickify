export type UserRole = "super_admin" | "admin" | "instructor" | "student" | "support";

const roleRank: Record<UserRole, number> = {
  student: 1,
  instructor: 2,
  support: 3,
  admin: 4,
  super_admin: 5
};

export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole) {
  if (!userRole) return false;
  return roleRank[userRole] >= roleRank[requiredRole];
}

export function canAccessAdmin(userRole: UserRole | undefined) {
  return hasRole(userRole, "admin");
}

export function canManageRoles(userRole: UserRole | undefined) {
  return userRole === "super_admin";
}
