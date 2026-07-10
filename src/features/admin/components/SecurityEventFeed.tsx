"use client"

import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { SecurityCard } from "@/components/admin/SecurityCard"
import { useSecurityEvents } from "../hooks/useSettings"

/** Security event feed — failed logins, lockouts, suspicious activity. */
export function SecurityEventFeed() {
  const { data, isLoading, isError, refetch } = useSecurityEvents()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load security events." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No security events" description="Security events will appear here." />
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((event) => (
        <SecurityCard key={event.id} event={event} />
      ))}
    </div>
  )
}
