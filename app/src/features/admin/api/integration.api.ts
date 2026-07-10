import { apiClient } from "@/lib/api/client"
import type { Integration } from "../types"
import { mockIntegrations } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchIntegrations(): Promise<Integration[]> {
  if (USE_MOCK) return delay(mockIntegrations)
  const { data } = await apiClient.get<Integration[]>("/admin/integrations")
  return data
}

export async function updateIntegration(
  id: string,
  values: { apiKey?: string; endpoint?: string }
): Promise<Integration> {
  if (USE_MOCK) {
    const existing = mockIntegrations.find((i) => i.id === id)
    if (!existing) throw new Error("Integration not found")
    return delay({ ...existing, ...values, status: "connected", lastSyncAt: new Date().toISOString() })
  }
  const { data } = await apiClient.put<Integration>(`/admin/integrations/${id}`, values)
  return data
}

export async function disconnectIntegration(id: string): Promise<Integration> {
  if (USE_MOCK) {
    const existing = mockIntegrations.find((i) => i.id === id)
    if (!existing) throw new Error("Integration not found")
    return delay({ ...existing, status: "disconnected" })
  }
  const { data } = await apiClient.post<Integration>(`/admin/integrations/${id}/disconnect`)
  return data
}

export async function syncIntegration(id: string): Promise<Integration> {
  if (USE_MOCK) {
    const existing = mockIntegrations.find((i) => i.id === id)
    if (!existing) throw new Error("Integration not found")
    return delay({ ...existing, lastSyncAt: new Date().toISOString() })
  }
  const { data } = await apiClient.post<Integration>(`/admin/integrations/${id}/sync`)
  return data
}
