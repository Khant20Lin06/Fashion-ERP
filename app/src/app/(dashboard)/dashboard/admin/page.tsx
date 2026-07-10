"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AuditTimeline } from "@/components/admin/AuditTimeline"
import { AdminKpiSection } from "@/features/admin/components/AdminKpiSection"
import { ModuleStatusList } from "@/features/admin/components/ModuleStatusList"
import { SystemActivityTimeline } from "@/features/admin/components/SystemActivityTimeline"
import { useAuditEntries } from "@/features/admin/hooks/useSettings"

export default function AdminDashboardPage() {
  const { data: auditEntries, isLoading: loadingAudit } = useAuditEntries()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Administration</h1>
        <p className="text-sm text-muted-foreground">Enterprise configuration, security, and platform health.</p>
      </div>

      <AdminKpiSection />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemActivityTimeline />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Module Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ModuleStatusList />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Changes</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAudit ? <Skeleton className="h-64 w-full" /> : <AuditTimeline entries={(auditEntries ?? []).slice(0, 5)} />}
        </CardContent>
      </Card>
    </div>
  )
}
