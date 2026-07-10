"use client"

import { Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useNotifications, useMarkNotificationsRead } from "../hooks/use-notifications"
import { NotificationItem } from "./NotificationItem"
import type { Notification } from "../types"

export function NotificationDropdown() {
  const { data: notifications, isLoading } = useNotifications()
  const { markRead, markAllRead } = useMarkNotificationsRead()

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0

  function handleSelect(notification: Notification) {
    if (!notification.isRead) markRead([notification.id])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 size-4 justify-center rounded-full p-0 text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-auto gap-1.5 p-1 text-xs">
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-96">
          <div className="flex flex-col gap-0.5 p-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))
            ) : !notifications || notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="You're all caught up"
                description="No new notifications right now."
                className="border-none py-10"
              />
            ) : (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onSelect={handleSelect} />
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
