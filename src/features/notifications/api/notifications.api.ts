import type { Notification } from "../types"

const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "low_stock",
    title: "Low stock alert",
    message: "Nike Hoodie only 5 remaining",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isRead: false,
    href: "/dashboard/inventory",
  },
  {
    id: "n2",
    type: "new_order",
    title: "New order received",
    message: "ORD-10234 from Sarah Chen ($284.50)",
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    isRead: false,
    href: "/dashboard/sales/invoices",
  },
  {
    id: "n3",
    type: "approval_request",
    title: "Approval request",
    message: "Discount request of ฿1,200 from Nina L. needs your approval",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: "n4",
    type: "payment_pending",
    title: "Payment pending",
    message: "Supplier payment to Levi's Co. is due in 2 days",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    href: "/dashboard/purchase",
  },
]

/** Mock notifications API — swap for a real WebSocket/polling source later. */
export async function fetchNotifications(): Promise<Notification[]> {
  return mockNotifications
}
