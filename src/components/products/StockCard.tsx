import { Warehouse } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/format"
import type { WarehouseStock } from "@/features/products/types"

type StockCardProps = {
  stock: WarehouseStock
}

/** Per-warehouse stock breakdown card — Available / Reserved / Incoming. */
export function StockCard({ stock }: StockCardProps) {
  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-center gap-2">
          <Warehouse className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium">{stock.warehouseName}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-semibold tabular-nums text-success">{formatNumber(stock.available)}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums text-warning">{formatNumber(stock.reserved)}</p>
            <p className="text-xs text-muted-foreground">Reserved</p>
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums text-muted-foreground">{formatNumber(stock.incoming)}</p>
            <p className="text-xs text-muted-foreground">Incoming</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
