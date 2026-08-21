"use client"

import { PermissionTable } from "@/features/admin/components/PermissionTable"

export default function AdminPermissionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Permission Management</h1>
        <p className="text-sm text-muted-foreground">Start with a simple module matrix, then switch to advanced resource-level permissions when needed.</p>
      </div>
      <PermissionTable />
    </div>
  )
}
