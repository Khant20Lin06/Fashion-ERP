"use client"

import { Monitor, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/format"
import { useActiveSessions, useRevokeSession } from "../hooks/useSettings"

/** Active session list with per-session revoke — Access Control's Device Management view. */
export function ActiveSessionsList() {
  const { data, isLoading } = useActiveSessions()
  const { mutate: revokeSession, isPending } = useRevokeSession()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No active sessions" description="Active user sessions will appear here." />
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((session) => (
        <Card key={session.id}>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Monitor className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{session.userName}</p>
              <p className="text-xs text-muted-foreground">
                {session.device} · {session.location} · {session.ipAddress}
              </p>
              <p className="text-xs text-muted-foreground">Active {formatRelativeTime(session.lastActiveAt)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Revoke session"
              onClick={() => revokeSession(session.id)}
              disabled={isPending}
            >
              <X className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
