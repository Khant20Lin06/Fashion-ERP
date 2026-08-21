"use client"

import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/format"
import { useMarkNotificationRead, useNotifications } from "../hooks/useSettings"

/** Notification Center — company-level notification list, mark as read.
 * There is no bulk "mark all read" endpoint on the backend (only
 * PATCH /notifications/:id/read, one at a time) — no "Mark All Read"
 * action is offered. `eventType` is a free-form string set by the
 * originating Kafka event (e.g. "payment.confirmed"), not a closed
 * frontend-invented type set, so it's rendered as plain text rather than
 * mapped to a fixed icon/label. */
export function NotificationCenter() {
  const { data, isLoading, isError, refetch } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load notifications." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No notifications" description="You're all caught up." />
  }

  const unreadCount = data.filter((n) => !n.read).length

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{unreadCount}</span> unread
      </p>

      <div className="flex flex-col gap-2">
        {data.map((notification) => (
          <Card key={notification.id} className={notification.read ? "opacity-70" : undefined}>
            <CardContent
              className="flex cursor-pointer items-start gap-3"
              onClick={() => !notification.read && markRead(notification.id)}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Bell className="size-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{notification.title}</p>
                  {!notification.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">{notification.body}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{notification.eventType}</Badge>
                  <span>{formatRelativeTime(notification.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
