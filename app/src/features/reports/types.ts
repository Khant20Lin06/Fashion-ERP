/** Core domain types for the Reports & Business Intelligence module. */

export type DateRangePreset = "today" | "this_week" | "this_month" | "custom"

export type DateRange = {
  preset: DateRangePreset
  from: string
  to: string
}

export type Granularity = "daily" | "weekly" | "monthly"

// --- Executive Dashboard ---

export type ExecutiveKpis = {
  totalRevenue: number
  revenueChangePercent: number
  grossProfit: number
  grossMarginPercent: number
  totalOrders: number
  customerGrowthPercent: number
}

export type SalesPerformancePoint = {
  period: string
  target: number
  actual: number
}

export type ExecutiveInventoryHealth = {
  totalStockValue: number
  fastMovingCount: number
  slowMovingCount: number
  deadStockCount: number
}

// --- Sales Reports ---

export type SalesReportFilters = {
  dateRange: DateRange
  branch?: string
  warehouse?: string
  salesPerson?: string
  customerGroup?: string
  productCategory?: string
}

export type SalesMetrics = {
  totalSales: number
  orderCount: number
  averageOrderValue: number
  discountAmount: number
  returnAmount: number
  netSales: number
}

export type RevenueTrendPoint = {
  period: string
  revenue: number
}

export type CategorySalesPoint = {
  category: string
  amount: number
}

export type PaymentMethodSalesPoint = {
  method: string
  amount: number
}

export type SalesDetailRow = {
  id: string
  date: string
  invoiceNumber: string
  customerName: string
  productName: string
  amount: number
  discount: number
  paymentMethod: string
  salesPerson: string
}

// --- Inventory Reports ---

export type InventoryMetrics = {
  totalStockValue: number
  availableQuantity: number
  lowStockCount: number
  deadStockCount: number
  fastMovingCount: number
  slowMovingCount: number
}

export type StockDistributionPoint = {
  label: string
  value: number
}

export type StockMovementPoint = {
  period: string
  incoming: number
  outgoing: number
  adjustment: number
}

export type InventoryAgingBucket = {
  bucket: "0-30" | "30-90" | "90+"
  quantity: number
}

export type InventoryReportRow = {
  id: string
  productName: string
  sku: string
  variantLabel?: string
  warehouseName: string
  quantity: number
  cost: number
  value: number
  status: "available" | "low_stock" | "out_of_stock" | "dead_stock"
}

// --- Purchase Reports ---

export type PurchaseReportMetrics = {
  totalPurchase: number
  supplierCount: number
  pendingOrders: number
  averageCost: number
}

export type SupplierPerformanceRow = {
  supplierId: string
  supplierName: string
  purchaseAmount: number
  deliveryRatePercent: number
  qualityScore: number
  paymentStatus: "paid" | "partial" | "unpaid"
}

export type PurchaseTrendPoint = {
  period: string
  amount: number
}

export type SupplierComparisonPoint = {
  supplierName: string
  amount: number
}

export type CostChangePoint = {
  productName: string
  previousCost: number
  currentCost: number
}

// --- Customer Reports ---

export type CustomerInsightMetrics = {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  vipCustomers: number
  customerLifetimeValue: number
}

export type CustomerSegment = "vip" | "regular" | "new" | "inactive"

export type CustomerSegmentPoint = {
  segment: CustomerSegment
  count: number
}

export type CustomerGrowthPoint = {
  period: string
  newCustomers: number
  totalCustomers: number
}

export type PurchaseFrequencyPoint = {
  bucket: string
  customerCount: number
}

export type SpendingDistributionPoint = {
  bucket: string
  customerCount: number
}

// --- Product Reports ---

export type ProductPerformanceMetrics = {
  topSellingCount: number
  highestProfitCount: number
  slowMovingCount: number
  outOfStockCount: number
}

export type ProductRankingRow = {
  productName: string
  unitsSold: number
  revenue: number
  profitMargin: number
}

export type SizeAnalysisPoint = {
  size: string
  percentSold: number
}

export type ColorAnalysisPoint = {
  color: string
  percentSold: number
}

// --- Financial Reports ---

export type FinancialOverview = {
  revenue: number
  costOfGoodsSold: number
  grossProfit: number
  expenses: number
  netProfit: number
}

export type ProfitTrendPoint = {
  period: string
  profit: number
}

export type ExpenseBreakdownPoint = {
  category: string
  amount: number
}

export type MarginAnalysisPoint = {
  period: string
  grossMarginPercent: number
  netMarginPercent: number
}

// --- Export ---

export type ExportFormat = "csv" | "excel" | "pdf" | "print"

// --- Scheduled Reports ---

export type ReportType =
  | "sales"
  | "inventory"
  | "purchase"
  | "customer"
  | "product"
  | "finance"
  | "executive"

export type ScheduleFrequency = "daily" | "weekly" | "monthly"

export type ScheduledReport = {
  id: string
  reportType: ReportType
  frequency: ScheduleFrequency
  recipientEmail: string
  format: ExportFormat
  time: string
  isActive: boolean
  lastSentAt?: string
}

// --- Dashboard Builder ---

export type WidgetType =
  | "kpi_revenue"
  | "kpi_profit"
  | "kpi_orders"
  | "kpi_customers"
  | "revenue_chart"
  | "profit_chart"
  | "inventory_chart"
  | "customer_chart"
  | "purchase_chart"
  | "top_products"
  | "top_customers"

export type DashboardWidget = {
  id: string
  type: WidgetType
  title: string
  colSpan: 1 | 2 | 3 | 4
}

export type CustomDashboardLayout = {
  id: string
  name: string
  role: string
  widgets: DashboardWidget[]
}

export type ReportFilters = {
  dateRange: DateRange
  branch?: string
  warehouse?: string
}
