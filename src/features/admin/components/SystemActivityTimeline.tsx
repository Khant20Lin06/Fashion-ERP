"use client"

import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/format"
import { useSystemActivity } from "../hooks/useSettings"

/** System Activity Timeline — recent actions across the whole platform. */
export function SystemActivityTimeline() {
  const { data, isLoading } = useSystemActivity()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No recent activity" description="System-wide activity will appear here." />
  }

  return (
    <div className="flex flex-col">
      {data.map((entry, index) => (
        <div key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
          <div className="flex flex-col items-center">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
            {index < data.length - 1 && <span className="w-px flex-1 bg-border" />}
          </div>
          <div className="pb-1">
            <p className="text-sm">
              <span className="font-medium">{entry.actor}</span> {entry.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {entry.module} · {formatRelativeTime(entry.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
