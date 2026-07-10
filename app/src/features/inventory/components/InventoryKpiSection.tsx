import type { LucideIcon } from "lucide-react"
import { AlertTriangle, DollarSign, PackageX, Warehouse } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { InventoryKpis } from "../types"

type KpiTileProps = {
  label: string
  value: string
  helper: string
  icon: LucideIcon
  tone: "default" | "warning" | "destructive"
}

const toneStyles = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
} as const

function KpiTile({ label, value, helper, icon: Icon, tone }: KpiTileProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className={cn("flex size-8 items-center justify-center rounded-md", toneStyles[tone])}>
            <Icon className="size-4" />
          </div>
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  )
}

function KpiTileSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-8 rounded-md" />
        </div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3.5 w-32" />
      </CardContent>
    </Card>
  )
}

type InventoryKpiSectionProps = {
  kpis: InventoryKpis | undefined
  isLoading: boolean
}

/** The four Stock Overview KPI tiles: Total Inventory Value, Total Products, Low Stock, Out of Stock. */
export function InventoryKpiSection({ kpis, isLoading }: InventoryKpiSectionProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiTileSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiTile
        label="Total Inventory Value"
        value={formatCurrency(kpis.totalInventoryValue)}
        helper="Current stock valuation"
        icon={DollarSign}
        tone="default"
      />
      <KpiTile
        label="Total Products"
        value={formatNumber(kpis.totalProducts)}
        helper="Active SKUs"
        icon={Warehouse}
        tone="default"
      />
      <KpiTile
        label="Low Stock Items"
        value={formatNumber(kpis.lowStockItems)}
        helper="Need replenishment"
        icon={AlertTriangle}
        tone="warning"
      />
      <KpiTile
        label="Out of Stock"
        value={formatNumber(kpis.outOfStockItems)}
        helper="Require purchase"
        icon={PackageX}
        tone="destructive"
      />
    </div>
  )
}
