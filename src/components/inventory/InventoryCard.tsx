import Image from "next/image"
import { Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/format"
import { StockBadge, deriveStockStatus } from "./StockBadge"
import type { InventoryItem } from "@/features/inventory/types"

type InventoryCardProps = {
  item: InventoryItem
}

/** Compact inventory item card for grid views and the barcode scanner result panel. */
export function InventoryCard({ item }: InventoryCardProps) {
  const status = deriveStockStatus(item.availableQty, item.reorderLevel, item.overstockLevel)

  return (
    <Card className="py-4">
      <CardContent className="flex items-start gap-3 px-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="size-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-medium">{item.productName}</p>
            <StockBadge status={status} />
          </div>
          <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
          {(item.color || item.size) && (
            <p className="text-xs text-muted-foreground">
              {[item.color, item.size].filter(Boolean).join(" / ")}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{item.warehouseName}</p>
          <div className="flex items-center gap-3 text-xs">
            <span>
              Available: <span className="font-medium">{formatNumber(item.availableQty)}</span>
            </span>
            <span>
              Reserved: <span className="font-medium">{formatNumber(item.reservedQty)}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
