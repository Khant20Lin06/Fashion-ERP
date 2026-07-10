"use client"

import { Building2, ShieldAlert, Store, Users } from "lucide-react"
import { AdminCard, AdminCardSkeleton } from "@/components/admin/AdminCard"
import { formatNumber } from "@/lib/format"
import { useAdminKpis } from "../hooks/useSettings"

/** Admin Dashboard KPI tiles — Active Users, Companies, Branches, Security Events. */
export function AdminKpiSection() {
  const { data, isLoading } = useAdminKpis()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {isLoading || !data ? (
        Array.from({ length: 4 }).map((_, i) => <AdminCardSkeleton key={i} />)
      ) : (
        <>
          <AdminCard label="Active Users" value={formatNumber(data.activeUsers)} helper={`${formatNumber(data.onlineNow)} Online Now`} icon={Users} />
          <AdminCard label="Companies" value={formatNumber(data.companies)} helper="Multi Company" icon={Building2} tone="success" />
          <AdminCard label="Branches" value={formatNumber(data.branches)} helper="Locations" icon={Store} tone="default" />
          <AdminCard label="Security Events" value={formatNumber(data.securityEventsToday)} helper="Today" icon={ShieldAlert} tone="warning" />
        </>
      )}
    </div>
  )
}
