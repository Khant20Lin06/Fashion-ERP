"use client"

import { PermissionTable } from "@/features/admin/components/PermissionTable"

export default function AdminPermissionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Advanced Permission Matrix</h1>
        <p className="text-sm text-muted-foreground">Role-based access control across every module and action.</p>
      </div>
      <PermissionTable />
    </div>
  )
}
