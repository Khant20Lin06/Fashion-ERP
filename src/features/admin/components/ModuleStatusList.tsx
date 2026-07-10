"use client"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useModuleStatuses } from "../hooks/useSettings"
import type { ModuleStatus } from "../types"

const statusVariant: Record<ModuleStatus["status"], "default" | "secondary" | "outline" | "destructive"> = {
  operational: "default",
  degraded: "outline",
  down: "destructive",
}

const statusDot: Record<ModuleStatus["status"], string> = {
  operational: "bg-success",
  degraded: "bg-warning",
  down: "bg-destructive",
}

/** Module Status — operational health and uptime per platform module. */
export function ModuleStatusList() {
  const { data, isLoading } = useModuleStatuses()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {(data ?? []).map((module) => (
        <div key={module.module} className="flex items-center justify-between rounded-md border px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className={`size-2 shrink-0 rounded-full ${statusDot[module.status]}`} />
            <span className="text-sm font-medium">{module.module}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{module.uptimePercent.toFixed(2)}% uptime</span>
            <Badge variant={statusVariant[module.status]} className="capitalize">
              {module.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
