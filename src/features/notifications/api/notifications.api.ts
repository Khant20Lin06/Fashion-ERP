import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { Notification } from "../types"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const mockNotifications: Notification[] = [
  {
    id: "n1",
    eventType: "inventory.low_stock",
    title: "Low stock alert",
    body: "Nike Hoodie only 5 remaining",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: "n2",
    eventType: "sales.order_created",
    title: "New order received",
    body: "ORD-10234 from Sarah Chen ($284.50)",
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    isRead: false,
  },
]

// Real controller: @Controller('notifications') — company-scoped, in-app
// only. Same contract as src/features/admin/api/audit.api.ts's notification
// functions (Phase 10); duplicated here rather than cross-imported since
// this is a distinct consumer (header bell) of the same real endpoint.

type BackendNotification = {
  id: string
  eventType: string
  title: string
  body: string
  readAt: string | null
  createdAt: string
}

function mapBackendToNotification(n: BackendNotification): Notification {
  return {
    id: n.id,
    eventType: n.eventType,
    title: n.title,
    body: n.body,
    isRead: !!n.readAt,
    createdAt: n.createdAt,
  }
}

export async function fetchNotifications(): Promise<Notification[]> {
  if (USE_MOCK) return delay(mockNotifications)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendNotification[]; meta: unknown }>("/notifications", {
    params: { companyId, limit: 50 },
  })
  return (data.data ?? []).map(mapBackendToNotification)
}

export async function markNotificationRead(id: string): Promise<Notification> {
  if (USE_MOCK) {
    const existing = mockNotifications.find((n) => n.id === id)
    if (!existing) throw new Error("Notification not found")
    return delay({ ...existing, isRead: true })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendNotification>(`/notifications/${id}/read`, undefined, {
    params: { companyId },
  })
  return mapBackendToNotification(data)
}
