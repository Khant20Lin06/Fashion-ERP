import { Badge } from "@/components/ui/badge"
import type { StockStatus } from "@/features/inventory/types"

const statusConfig: Record<StockStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  available: { label: "Available", variant: "default" },
  out_of_stock: { label: "Out of Stock", variant: "destructive" },
}

// Only "available" / "out_of_stock" are derivable from real backend data.
// No reorder-level or overstock-level field exists anywhere in the schema
// (see erp-pos fashion api WarehouseStockEntity) — a "low stock"/"over
// stock" threshold would be a fabricated business rule, so those statuses
// were removed rather than backed by an invented number.
export function deriveStockStatus(availableQty: number): StockStatus {
  return availableQty === 0 ? "out_of_stock" : "available"
}

type StockBadgeProps = {
  status: StockStatus
}

/** Badge for inventory stock status — Available / Out of Stock. */
export function StockBadge({ status }: StockBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}
