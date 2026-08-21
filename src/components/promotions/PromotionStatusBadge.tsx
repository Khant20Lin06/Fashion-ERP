import { Badge } from "@/components/ui/badge"
import type { PromotionStatus } from "@/features/promotions/types"

const config: Record<PromotionStatus, { label: string; variant: "default" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "default" },
  INACTIVE: { label: "Inactive", variant: "outline" },
}

/** Status badge for a Promotion — mirrors the real backend's two-value status enum (ACTIVE/INACTIVE). */
export function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
