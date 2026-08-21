import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type {
  ActiveSession,
  AdminAuditEntry,
  AdminKpis,
  AdminNotification,
  AuditFilters,
  ModuleStatus,
  SecurityEvent,
  SystemActivityPoint,
} from "../types"
import {
  adminKpis,
  mockActiveSessions,
  mockAdminAuditEntries,
  mockCompanies,
  mockNotifications,
  mockSecurityEvents,
  moduleStatuses,
  systemActivity,
} from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Admin Dashboard ---

export async function fetchAdminKpis(): Promise<AdminKpis> {
  if (USE_MOCK) return delay(adminKpis)
  const { data } = await apiClient.get<AdminKpis>("/admin/dashboard/kpis")
  return data
}

export async function fetchSystemActivity(): Promise<SystemActivityPoint[]> {
  if (USE_MOCK) return delay(systemActivity)
  const { data } = await apiClient.get<SystemActivityPoint[]>("/admin/dashboard/activity")
  return data
}

export async function fetchModuleStatuses(): Promise<ModuleStatus[]> {
  if (USE_MOCK) return delay(moduleStatuses)
  const { data } = await apiClient.get<ModuleStatus[]>("/admin/dashboard/module-status")
  return data
}

// --- Audit ---

export async function fetchAuditEntries(filters?: AuditFilters): Promise<AdminAuditEntry[]> {
  if (USE_MOCK) {
    let results = mockAdminAuditEntries
    if (filters?.module) results = results.filter((e) => e.module === filters.module)
    if (filters?.action) results = results.filter((e) => e.action === filters.action)
    if (filters?.user) results = results.filter((e) => e.user === filters.user)
    if (filters?.companyId) {
      const company = mockCompanies.find((c) => c.id === filters.companyId)
      if (company) results = results.filter((e) => e.companyName === company.name)
    }
    return delay(results)
  }
  const { data } = await apiClient.get<AdminAuditEntry[]>("/admin/audit", { params: filters })
  return data
}

// --- Notifications ---
// Real controller: @Controller('notifications') — NOT /admin/notifications.
// DataScope-enforced (companyId required, same resolveCompanyId() pattern
// as Employees/Settings). GET (list) + PATCH :id/read only — no POST (every
// Notification is created exclusively by NotificationEventConsumer reacting
// to a Kafka event, never via a client-facing endpoint) and no bulk
// mark-all-read (only one-at-a-time exists on the backend).

type BackendNotification = {
  id: string
  companyId: string
  userId: string | null
  eventType: string
  channel: string
  title: string
  body: string
  status: string
  readAt: string | null
  createdAt: string
}

function mapBackendToNotification(n: BackendNotification): AdminNotification {
  return {
    id: n.id,
    eventType: n.eventType,
    title: n.title,
    body: n.body,
    read: !!n.readAt,
    readAt: n.readAt,
    createdAt: n.createdAt,
  }
}

export async function fetchNotifications(): Promise<AdminNotification[]> {
  if (USE_MOCK) return delay(mockNotifications)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendNotification[]; meta: unknown }>("/notifications", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map(mapBackendToNotification)
}

export async function markNotificationRead(id: string): Promise<AdminNotification> {
  if (USE_MOCK) {
    const existing = mockNotifications.find((n) => n.id === id)
    if (!existing) throw new Error("Notification not found")
    return delay({ ...existing, read: true, readAt: new Date().toISOString() })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendNotification>(`/notifications/${id}/read`, undefined, {
    params: { companyId },
  })
  return mapBackendToNotification(data)
}

// --- Security ---

export async function fetchSecurityEvents(): Promise<SecurityEvent[]> {
  if (USE_MOCK) return delay(mockSecurityEvents)
  const { data } = await apiClient.get<SecurityEvent[]>("/admin/security/events")
  return data
}

export async function fetchActiveSessions(): Promise<ActiveSession[]> {
  if (USE_MOCK) return delay(mockActiveSessions)
  const { data } = await apiClient.get<ActiveSession[]>("/admin/security/sessions")
  return data
}

export async function revokeSession(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/admin/security/sessions/${id}`)
}
