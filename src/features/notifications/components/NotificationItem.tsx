import Link from "next/link"
import { AlertTriangle, ShoppingBag, Clock, ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format"
import type { Notification, NotificationType } from "../types"

const iconByType: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  low_stock: AlertTriangle,
  new_order: ShoppingBag,
  payment_pending: Clock,
  approval_request: ClipboardCheck,
}

const toneByType: Record<NotificationType, string> = {
  low_stock: "bg-warning/10 text-warning",
  new_order: "bg-success/10 text-success",
  payment_pending: "bg-info/10 text-info",
  approval_request: "bg-primary/10 text-primary",
}

type NotificationItemProps = {
  notification: Notification
  onSelect?: (notification: Notification) => void
}

export function NotificationItem({ notification, onSelect }: NotificationItemProps) {
  const Icon = iconByType[notification.type]

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/60",
        !notification.isRead && "bg-primary/5"
      )}
    >
      <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", toneByType[notification.type])}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{notification.title}</p>
          {!notification.isRead && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">{formatRelativeTime(notification.createdAt)}</p>
      </div>
    </div>
  )

  if (notification.href) {
    return (
      <Link href={notification.href} onClick={() => onSelect?.(notification)} className="block">
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={() => onSelect?.(notification)} className="block w-full text-left">
      {content}
    </button>
  )
}
