export type NotificationType = "low_stock" | "new_order" | "payment_pending" | "approval_request"

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  isRead: boolean
  href?: string
}
