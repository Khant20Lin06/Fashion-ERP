import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format"
import type { Notification } from "../types"

type NotificationItemProps = {
  notification: Notification
  onSelect?: (notification: Notification) => void
}

export function NotificationItem({ notification, onSelect }: NotificationItemProps) {
  return (
    <button type="button" onClick={() => onSelect?.(notification)} className="block w-full text-left">
      <div
        className={cn(
          "flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/60",
          !notification.isRead && "bg-primary/5"
        )}
      >
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bell className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{notification.title}</p>
            {!notification.isRead && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</p>
          <p className="mt-1 text-xs text-muted-foreground/70">{formatRelativeTime(notification.createdAt)}</p>
        </div>
      </div>
    </button>
  )
}
