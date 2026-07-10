import { Badge } from "@/components/ui/badge"
import type { StockStatus } from "@/features/inventory/types"

const statusConfig: Record<StockStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  available: { label: "Available", variant: "default" },
  low_stock: { label: "Low Stock", variant: "outline", className: "border-warning text-warning" },
  out_of_stock: { label: "Out of Stock", variant: "destructive" },
  over_stock: { label: "Over Stock", variant: "secondary" },
  reserved: { label: "Reserved", variant: "outline" },
}

export function deriveStockStatus(availableQty: number, reorderLevel: number, overstockLevel: number): StockStatus {
  if (availableQty === 0) return "out_of_stock"
  if (availableQty <= reorderLevel) return "low_stock"
  if (availableQty >= overstockLevel) return "over_stock"
  return "available"
}

type StockBadgeProps = {
  status: StockStatus
}

/** Badge for inventory stock status — Available / Low Stock / Out of Stock / Over Stock / Reserved. */
export function StockBadge({ status }: StockBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}
