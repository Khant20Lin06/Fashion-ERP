"use client"

import { AlertTriangle, Ban, ShieldAlert, Users } from "lucide-react"
import { AdminCard, AdminCardSkeleton } from "@/components/admin/AdminCard"
import { formatNumber } from "@/lib/format"
import { useActiveSessions, useSecurityEvents } from "../hooks/useSettings"

/** Security Dashboard — Failed Login, Active Sessions, Security Events, Blocked Users tiles. */
export function SecurityDashboard() {
  const { data: events, isLoading: loadingEvents } = useSecurityEvents()
  const { data: sessions, isLoading: loadingSessions } = useActiveSessions()

  const failedLogins = (events ?? []).filter((e) => e.type === "failed_login").length
  const blockedUsers = (events ?? []).filter((e) => e.type === "account_locked" || e.type === "ip_blocked").length

  const isLoading = loadingEvents || loadingSessions

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => <AdminCardSkeleton key={i} />)
      ) : (
        <>
          <AdminCard label="Failed Login" value={formatNumber(failedLogins)} helper="Today" icon={AlertTriangle} tone="warning" />
          <AdminCard label="Active Sessions" value={formatNumber(sessions?.length ?? 0)} helper="Right now" icon={Users} tone="default" />
          <AdminCard label="Security Events" value={formatNumber(events?.length ?? 0)} helper="Today" icon={ShieldAlert} tone="destructive" />
          <AdminCard label="Blocked Users" value={formatNumber(blockedUsers)} helper="Total" icon={Ban} tone="destructive" />
        </>
      )}
    </div>
  )
}
