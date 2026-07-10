import { Badge } from "@/components/ui/badge"
import type { AdminUserStatus } from "@/features/admin/types"

type RoleBadgeProps = {
  roleName: string
  isSystem?: boolean
}

/** Role name badge — system roles (Super Admin, Company Admin, Employee) render with distinct emphasis. */
export function RoleBadge({ roleName, isSystem }: RoleBadgeProps) {
  return <Badge variant={isSystem ? "default" : "secondary"}>{roleName}</Badge>
}

const statusConfig: Record<AdminUserStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  locked: { label: "Locked", variant: "destructive" },
  pending: { label: "Pending", variant: "outline" },
}

/** Admin user status badge — Active / Inactive / Locked / Pending. */
export function AdminUserStatusBadge({ status }: { status: AdminUserStatus }) {
  const { label, variant } = statusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}
