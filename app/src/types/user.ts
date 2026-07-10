/**
 * Shared user/permission types, consumed by auth, layout (sidebar visibility),
 * and any feature needing to check role/permission.
 */

export type UserRole =
  | "super_admin"
  | "business_owner"
  | "regional_manager"
  | "branch_manager"
  | "store_manager"
  | "cashier"
  | "sales_associate"
  | "warehouse_staff"
  | "inventory_controller"
  | "purchasing_officer"
  | "accountant"
  | "finance_manager"
  | "marketing_team"
  | "hr_manager"
  | "system_administrator"
  | "developer"

export type Permission = {
  module: string
  actions: Array<"view" | "create" | "edit" | "delete" | "approve" | "export" | "manage">
}

export type AuthUser = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: UserRole
  branchId?: string
  branchName?: string
  permissions: Permission[]
}

export function hasPermission(
  user: AuthUser | null | undefined,
  module: string,
  action: Permission["actions"][number]
): boolean {
  if (!user) return false
  if (user.role === "super_admin") return true
  const modulePermission = user.permissions.find((p) => p.module === module || p.module === "*")
  return modulePermission?.actions.includes(action) ?? false
}
