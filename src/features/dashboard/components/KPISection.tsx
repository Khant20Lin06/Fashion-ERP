import {
  DollarSign,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Package,
  AlertTriangle,
  PackageX,
  Warehouse,
  Users,
  UserPlus,
  Award,
  ClipboardList,
  type LucideIcon,
} from "lucide-react"
import { KPICard, KPICardSkeleton } from "@/components/dashboard/KPICard"
import { EmptyState } from "@/components/ui/empty-state"
import type { KpiMetric } from "../types"

const iconByMetricId: Record<string, LucideIcon> = {
  "today-revenue": DollarSign,
  "monthly-revenue": TrendingUp,
  "total-orders": ShoppingCart,
  "avg-order-value": Receipt,
  "total-products": Package,
  "low-stock": AlertTriangle,
  "out-of-stock": PackageX,
  "stock-value": Warehouse,
  "total-customers": Users,
  "new-customers": UserPlus,
  "loyalty-members": Award,
  "pending-po": ClipboardList,
}

type KPISectionProps = {
  metrics: KpiMetric[] | undefined
  isLoading: boolean
  visibleMetricIds?: string[]
}

/** Responsive KPI grid — the top row of the dashboard. */
export function KPISection({ metrics, isLoading, visibleMetricIds }: KPISectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const filtered = visibleMetricIds
    ? metrics?.filter((m) => visibleMetricIds.includes(m.id))
    : metrics

  if (!filtered || filtered.length === 0) {
    return <EmptyState title="No metrics available" description="KPI data will appear here once available." />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {filtered.map((metric) => (
        <KPICard key={metric.id} metric={metric} icon={iconByMetricId[metric.id]} />
      ))}
    </div>
  )
}
