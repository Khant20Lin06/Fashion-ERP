"use client"

import { AuditLogView } from "@/features/admin/components/AuditLogView"

export default function AdminAuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">Track every change across users, modules, and companies.</p>
      </div>
      <AuditLogView />
    </div>
  )
}
