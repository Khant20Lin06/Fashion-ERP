import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type {
  WebhookDelivery,
  WebhookSubscription,
  WebhookSubscriptionCreated,
  WebhookTestResult,
} from "../types"
import { mockDeliveries, mockWebhooks } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// ---------- Backend DTO types (erp-pos fashion api src/modules/webhooks) ----------
// Real routes: GET/POST /webhooks, GET/PATCH/DELETE /webhooks/:id,
// POST /webhooks/:id/test, GET /webhooks/:webhookId/deliveries.
// permission webhooks.read/create/update/delete. DataScope-enforced via
// resolveRequestCompanyId on every route (companyId is a hint, never
// trusted directly). WebhookSubscriptionResponseDto NEVER includes
// `secret` — it is only ever present on the POST create response
// (WebhookSubscriptionCreatedResponseDto), confirmed by reading the real
// DTO/mapper: no other endpoint's response type has a secret field at
// all, so there's no risk of accidentally rendering it elsewhere.

type BackendWebhookSubscription = {
  id: string
  companyId: string
  url: string
  description: string | null
  events: string[]
  isActive: boolean
  failureCount: number
  lastDeliveredAt: string | null
  createdAt: string
  updatedAt: string
}

type BackendWebhookSubscriptionCreated = BackendWebhookSubscription & {
  secret: string
}

type BackendWebhookDelivery = {
  id: string
  webhookSubscriptionId: string
  eventId: string
  eventType: string
  status: "PENDING" | "DELIVERED" | "FAILED"
  attempt: number
  responseStatus: number | null
  responseBody: string | null
  errorMessage: string | null
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
}

function mapSubscription(b: BackendWebhookSubscription): WebhookSubscription {
  return {
    id: b.id,
    companyId: b.companyId,
    url: b.url,
    description: b.description,
    events: b.events,
    isActive: b.isActive,
    failureCount: b.failureCount,
    lastDeliveredAt: b.lastDeliveredAt,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }
}

function mapSubscriptionCreated(b: BackendWebhookSubscriptionCreated): WebhookSubscriptionCreated {
  return { ...mapSubscription(b), secret: b.secret }
}

function mapDelivery(b: BackendWebhookDelivery): WebhookDelivery {
  return {
    id: b.id,
    webhookSubscriptionId: b.webhookSubscriptionId,
    eventId: b.eventId,
    eventType: b.eventType,
    status: b.status,
    attempt: b.attempt,
    responseStatus: b.responseStatus,
    responseBody: b.responseBody,
    errorMessage: b.errorMessage,
    deliveredAt: b.deliveredAt,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }
}

export async function fetchWebhooks(): Promise<WebhookSubscription[]> {
  if (USE_MOCK) return delay(mockWebhooks)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendWebhookSubscription[]; meta: unknown }>("/webhooks", {
    params: { companyId, limit: 100 },
  })
  return (data.data ?? []).map(mapSubscription)
}

export async function fetchWebhookById(id: string): Promise<WebhookSubscription | undefined> {
  if (USE_MOCK) return delay(mockWebhooks.find((w) => w.id === id))
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<BackendWebhookSubscription>(`/webhooks/${id}`, {
    params: { companyId },
  })
  return mapSubscription(data)
}

export type CreateWebhookInput = {
  url: string
  description?: string
  events: string[]
}

export async function createWebhook(values: CreateWebhookInput): Promise<WebhookSubscriptionCreated> {
  if (USE_MOCK) {
    return delay({
      id: `wh-${Date.now()}`,
      companyId: "company-mock",
      url: values.url,
      description: values.description ?? null,
      events: values.events,
      isActive: true,
      failureCount: 0,
      lastDeliveredAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      secret: "whsec_mock_" + Math.random().toString(36).slice(2),
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendWebhookSubscriptionCreated>("/webhooks", {
    companyId,
    url: values.url,
    description: values.description || undefined,
    events: values.events,
  })
  return mapSubscriptionCreated(data)
}

export type UpdateWebhookInput = {
  url?: string
  description?: string
  events?: string[]
  isActive?: boolean
}

export async function updateWebhook(id: string, values: UpdateWebhookInput): Promise<WebhookSubscription> {
  if (USE_MOCK) {
    const existing = mockWebhooks.find((w) => w.id === id)
    if (!existing) throw new Error("Webhook not found")
    return delay({ ...existing, ...values })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendWebhookSubscription>(
    `/webhooks/${id}`,
    values,
    { params: { companyId } },
  )
  return mapSubscription(data)
}

export async function deleteWebhook(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/webhooks/${id}`, { params: { companyId } })
}

export async function testWebhook(id: string): Promise<WebhookTestResult> {
  if (USE_MOCK) return delay({ status: 200, body: '{"ok":true}' })
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<WebhookTestResult>(`/webhooks/${id}/test`, null, {
    params: { companyId },
  })
  return data
}

export async function fetchWebhookDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
  if (USE_MOCK) return delay(mockDeliveries.filter((d) => d.webhookSubscriptionId === webhookId))
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendWebhookDelivery[]; meta: unknown }>(
    `/webhooks/${webhookId}/deliveries`,
    { params: { companyId, limit: 100 } },
  )
  return (data.data ?? []).map(mapDelivery)
}
