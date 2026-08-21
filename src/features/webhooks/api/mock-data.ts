import type { WebhookDelivery, WebhookSubscription } from "../types"

const now = Date.now()
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString()

export const mockWebhooks: WebhookSubscription[] = [
  {
    id: "wh-1",
    companyId: "company-mock",
    url: "https://example.com/hooks/payments",
    description: "Notify accounting system on confirmed receipts",
    events: ["payment.confirmed"],
    isActive: true,
    failureCount: 0,
    lastDeliveredAt: daysAgo(0),
    createdAt: daysAgo(14),
    updatedAt: daysAgo(1),
  },
  {
    id: "wh-2",
    companyId: "company-mock",
    url: "https://example.com/hooks/legacy",
    description: null,
    events: ["payment.confirmed"],
    isActive: false,
    failureCount: 3,
    lastDeliveredAt: daysAgo(9),
    createdAt: daysAgo(30),
    updatedAt: daysAgo(9),
  },
]

export const mockDeliveries: WebhookDelivery[] = [
  {
    id: "whd-1",
    webhookSubscriptionId: "wh-1",
    eventId: "evt-1",
    eventType: "payment.confirmed",
    status: "DELIVERED",
    attempt: 1,
    responseStatus: 200,
    responseBody: '{"ok":true}',
    errorMessage: null,
    deliveredAt: daysAgo(0),
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "whd-2",
    webhookSubscriptionId: "wh-1",
    eventId: "evt-2",
    eventType: "payment.confirmed",
    status: "FAILED",
    attempt: 3,
    responseStatus: 500,
    responseBody: null,
    errorMessage: "Connection timed out",
    deliveredAt: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
]
