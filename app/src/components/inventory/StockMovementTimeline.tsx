import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { formatNumber, formatRelativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { StockMovement } from "@/features/inventory/types"

type StockMovementTimelineProps = {
  movements: StockMovement[]
}

/** Vertical timeline of stock movements for a single product/variant — used in product/inventory detail views. */
export function StockMovementTimeline({ movements }: StockMovementTimelineProps) {
  if (movements.length === 0) {
    return <p className="text-sm text-muted-foreground">No movement history.</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {movements.map((movement) => {
        const isPositive = movement.qtyChange > 0
        const isNeutral = movement.qtyChange === 0
        return (
          <li key={movement.id} className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                isNeutral
                  ? "bg-muted text-muted-foreground"
                  : isPositive
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
              )}
            >
              {isNeutral ? <Minus className="size-3.5" /> : isPositive ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{movement.reference}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(movement.date)}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {movement.warehouseName} · {movement.user}
              </p>
              <p className="text-xs">
                {formatNumber(movement.qtyBefore)} &rarr; {formatNumber(movement.qtyAfter)}{" "}
                <span className={isPositive ? "text-success" : isNeutral ? "text-muted-foreground" : "text-destructive"}>
                  ({isPositive ? "+" : ""}
                  {formatNumber(movement.qtyChange)})
                </span>
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
