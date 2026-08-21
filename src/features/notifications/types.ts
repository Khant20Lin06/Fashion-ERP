// Matches the real backend NotificationResponseDto exactly (see
// erp-pos fashion api/src/modules/notifications/dto/notification-response.dto.ts).
// `eventType` is a free-form string set by the originating event (e.g.
// "payment.confirmed"), not a closed frontend-invented type set — there is
// no low_stock/new_order/payment_pending/approval_request enum on the
// backend. Notifications are company-level (no per-item deep-link href
// exists on the real DTO either).
export type Notification = {
  id: string
  eventType: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}
