export type TrendDirection = "up" | "down" | "flat"

export type KpiMetric = {
  id: string
  label: string
  value: number
  format: "currency" | "number" | "percent"
  changePercent: number
  trend: TrendDirection
  comparisonLabel: string
}

export type RevenuePoint = {
  period: string
  revenue: number
  target?: number
}

export type SalesTrendGranularity = "daily" | "weekly" | "monthly"

export type SalesTrendPoint = {
  period: string
  sales: number
  orders: number
}

export type StockDistributionPoint = {
  warehouse: string
  quantity: number
}

export type CategoryBreakdownPoint = {
  category: string
  value: number
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "refunded"

export type RecentOrder = {
  id: string
  orderNumber: string
  customerName: string
  date: string
  total: number
  status: OrderStatus
  itemCount: number
}

export type TopProduct = {
  id: string
  name: string
  sku: string
  category: string
  unitsSold: number
  revenue: number
  imageUrl?: string
}

export type LowStockItem = {
  id: string
  name: string
  sku: string
  category: string
  quantityRemaining: number
  reorderLevel: number
  warehouse: string
}

export type CustomerAnalyticsSummary = {
  totalCustomers: number
  newCustomersThisMonth: number
  loyaltyMembers: number
  repeatPurchaseRate: number
  topSegments: Array<{ segment: string; count: number }>
}

export type DashboardSummary = {
  kpis: KpiMetric[]
  revenueTrend: RevenuePoint[]
  salesTrend: SalesTrendPoint[]
  stockDistribution: StockDistributionPoint[]
  categoryBreakdown: CategoryBreakdownPoint[]
  recentOrders: RecentOrder[]
  topProducts: TopProduct[]
  lowStockItems: LowStockItem[]
  customerAnalytics: CustomerAnalyticsSummary
}

/** Dashboard widget keys used for RBAC-based visibility filtering. */
export type DashboardWidgetKey =
  | "kpis"
  | "salesOverview"
  | "revenueChart"
  | "inventoryStatus"
  | "recentOrders"
  | "topProducts"
  | "lowStockAlert"
  | "customerAnalytics"
