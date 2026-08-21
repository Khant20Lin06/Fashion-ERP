import { Badge } from "@/components/ui/badge"
import type { WebhookDeliveryStatus } from "@/features/webhooks/types"

const activeConfig = {
  true: { label: "Active", variant: "default" as const },
  false: { label: "Inactive", variant: "outline" as const },
}

/** Active/Inactive badge for a webhook subscription's isActive flag. */
export function WebhookActiveBadge({ isActive }: { isActive: boolean }) {
  const config = activeConfig[isActive ? "true" : "false"]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

const deliveryStatusConfig: Record<
  WebhookDeliveryStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  DELIVERED: { label: "Delivered", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" },
}

/** Status badge for a single webhook delivery attempt. */
export function WebhookDeliveryStatusBadge({ status }: { status: WebhookDeliveryStatus }) {
  const config = deliveryStatusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
