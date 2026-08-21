/** Core domain types for Webhook Subscription Management.
 * Mirrors the real backend contract exactly (erp-pos fashion api
 * src/modules/webhooks) — confirmed via direct controller/DTO reads
 * during the Phase 22 audit. There is no PATCH-settable `secret`, no
 * dedicated activate/deactivate route (isActive only changes via the
 * generic update), and only one real subscribable event type exists
 * today: "payment.confirmed".
 */

export const WEBHOOK_EVENT_TYPES = ["payment.confirmed"] as const
export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number]

export type WebhookSubscription = {
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

/** Only ever returned once, in the response of POST /webhooks — never
 * retrievable again through any other endpoint. */
export type WebhookSubscriptionCreated = WebhookSubscription & {
  secret: string
}

export type WebhookDeliveryStatus = "PENDING" | "DELIVERED" | "FAILED"

export type WebhookDelivery = {
  id: string
  webhookSubscriptionId: string
  eventId: string
  eventType: string
  status: WebhookDeliveryStatus
  attempt: number
  responseStatus: number | null
  responseBody: string | null
  errorMessage: string | null
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
}

export type WebhookTestResult = {
  status: number
  body: string | null
}
