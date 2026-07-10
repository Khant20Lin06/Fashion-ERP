"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ErrorState } from "@/components/ui/error-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AuditTimeline } from "@/components/admin/AuditTimeline"
import { useAuditEntries } from "../hooks/useSettings"
import { useCompanies } from "../hooks/useRoles"
import type { AuditAction } from "../types"

const actionOptions: AuditAction[] = ["create", "update", "delete", "approve", "login", "logout"]
const moduleOptions = ["Product", "User Management", "Purchase", "Accounting", "Authentication", "HR"]

const ALL = "all"

/** Audit Log view — filterable timeline of every tracked system action. */
export function AuditLogView() {
  const [module, setModule] = useState<string>(ALL)
  const [action, setAction] = useState<string>(ALL)
  const [companyId, setCompanyId] = useState<string>(ALL)
  const { data: companies } = useCompanies()

  const filters = useMemo(
    () => ({
      module: module === ALL ? undefined : module,
      action: action === ALL ? undefined : (action as AuditAction),
      companyId: companyId === ALL ? undefined : companyId,
    }),
    [module, action, companyId]
  )

  const { data, isLoading, isError, refetch } = useAuditEntries(filters)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-wrap gap-3">
          <Select value={module} onValueChange={setModule}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Module" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Modules</SelectItem>
              {moduleOptions.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Actions</SelectItem>
              {actionOptions.map((a) => (
                <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Company" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Companies</SelectItem>
              {(companies ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError ? (
        <ErrorState message="Couldn't load audit log." onRetry={refetch} />
      ) : (
        <Card>
          <CardContent>
            <AuditTimeline entries={data ?? []} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
