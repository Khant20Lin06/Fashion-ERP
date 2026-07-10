import { EmptyState } from "@/components/ui/empty-state"
import { StockCard } from "@/components/products/StockCard"
import { formatNumber } from "@/lib/format"
import type { WarehouseStock } from "../types"

type StockSummaryProps = {
  warehouseStock: WarehouseStock[]
}

/** Per-warehouse stock breakdown — Available / Reserved / Incoming — for the product detail's Inventory tab. */
export function StockSummary({ warehouseStock }: StockSummaryProps) {
  if (warehouseStock.length === 0) {
    return <EmptyState title="No stock records" description="This product has no warehouse stock allocated yet." />
  }

  const totals = warehouseStock.reduce(
    (acc, s) => ({
      available: acc.available + s.available,
      reserved: acc.reserved + s.reserved,
      incoming: acc.incoming + s.incoming,
    }),
    { available: 0, reserved: 0, incoming: 0 }
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {warehouseStock.map((stock) => (
          <StockCard key={stock.warehouseId} stock={stock} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Total across all warehouses: {formatNumber(totals.available)} available ·{" "}
        {formatNumber(totals.reserved)} reserved · {formatNumber(totals.incoming)} incoming
      </p>
    </div>
  )
}
