"use client"

import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCheck,
  CreditCard,
  Package,
  ShieldAlert,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/format"
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../hooks/useSettings"
import type { NotificationType } from "../types"

const typeIcon: Record<NotificationType, typeof Bell> = {
  system_alert: AlertTriangle,
  approval_request: CheckCheck,
  stock_alert: Package,
  payment_reminder: CreditCard,
  leave_request: CalendarClock,
  security_alert: ShieldAlert,
}

const channelLabel: Record<string, string> = {
  in_app: "In App",
  email: "Email",
  sms: "SMS",
  push: "Push",
}

/** Notification Center — unread count, notification list, mark as read. */
export function NotificationCenter() {
  const { data, isLoading, isError, refetch } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead()

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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{unreadCount}</span> unread
        </p>
        <Button variant="outline" size="sm" onClick={() => markAllRead()} disabled={markingAll || unreadCount === 0}>
          <CheckCheck /> Mark All Read
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {data.map((notification) => {
          const Icon = typeIcon[notification.type]
          return (
            <Card key={notification.id} className={notification.read ? "opacity-70" : undefined}>
              <CardContent
                className="flex cursor-pointer items-start gap-3"
                onClick={() => !notification.read && markRead(notification.id)}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{notification.title}</p>
                    {!notification.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{channelLabel[notification.channel]}</Badge>
                    <span>{formatRelativeTime(notification.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
