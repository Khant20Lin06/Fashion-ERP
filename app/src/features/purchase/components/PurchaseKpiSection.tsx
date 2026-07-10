import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber } from "@/lib/format"
import { ClipboardList, DollarSign, PackageCheck, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { PurchaseKpis } from "../types"

type KpiTileProps = {
  label: string
  value: string
  helper: string
  icon: LucideIcon
  tone: "default" | "warning"
}

const toneStyles = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
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

type PurchaseKpiSectionProps = {
  kpis: PurchaseKpis | undefined
  isLoading: boolean
}

/** The four Purchase Dashboard KPI tiles: Total Purchase, Pending Orders, Received Stock, Supplier Balance. */
export function PurchaseKpiSection({ kpis, isLoading }: PurchaseKpiSectionProps) {
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
        label="Total Purchase"
        value={formatCurrency(kpis.totalPurchaseValue)}
        helper="This Month"
        icon={DollarSign}
        tone="default"
      />
      <KpiTile
        label="Pending Purchase Orders"
        value={formatNumber(kpis.pendingOrders)}
        helper="Awaiting Delivery"
        icon={ClipboardList}
        tone="warning"
      />
      <KpiTile
        label="Received Stock"
        value={formatNumber(kpis.receivedItems)}
        helper="Units Received"
        icon={PackageCheck}
        tone="default"
      />
      <KpiTile
        label="Supplier Balance"
        value={formatCurrency(kpis.outstandingPayments)}
        helper="Outstanding"
        icon={Wallet}
        tone="warning"
      />
    </div>
  )
}
