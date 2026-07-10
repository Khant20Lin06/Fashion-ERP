import { Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { DiscountKind } from "@/features/sales/types"

const kindLabels: Record<DiscountKind, string> = {
  product: "Product",
  category: "Category",
  customer: "Customer",
  campaign: "Campaign",
}

type DiscountBadgeProps = {
  kind: DiscountKind
  percent: number
}

/** Compact discount indicator — e.g. "Campaign · 30% OFF" — used in POS cart lines and discount lists. */
export function DiscountBadge({ kind, percent }: DiscountBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1">
      <Tag className="size-3" />
      {kindLabels[kind]} · {percent}% OFF
    </Badge>
  )
}
