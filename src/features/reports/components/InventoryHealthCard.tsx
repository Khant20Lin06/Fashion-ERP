import { AlertTriangle, PackageX, Warehouse, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { ExecutiveInventoryHealth } from "../types"

type InventoryHealthCardProps = {
  data: ExecutiveInventoryHealth | undefined
  isLoading: boolean
}

/** Inventory Health summary widget for the Executive Dashboard. */
export function InventoryHealthCard({ data, isLoading }: InventoryHealthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Inventory Health</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : (
          <>
            <Stat icon={Warehouse} label="Stock Value" value={formatCurrency(data.totalStockValue)} />
            <Stat icon={Zap} label="Fast Moving" value={formatNumber(data.fastMovingCount)} tone="success" />
            <Stat icon={AlertTriangle} label="Slow Moving" value={formatNumber(data.slowMovingCount)} tone="warning" />
            <Stat icon={PackageX} label="Dead Stock" value={formatNumber(data.deadStockCount)} tone="destructive" />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Warehouse
  label: string
  value: string
  tone?: "default" | "success" | "warning" | "destructive"
}) {
  const toneClass = {
    default: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
  }[tone]

  return (
    <div className="flex items-center gap-3">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-md ${toneClass}`}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  )
}
