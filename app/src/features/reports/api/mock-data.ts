import type {
  ColorAnalysisPoint,
  CostChangePoint,
  CustomerGrowthPoint,
  CustomerInsightMetrics,
  CustomerSegmentPoint,
  ExecutiveInventoryHealth,
  ExecutiveKpis,
  ExpenseBreakdownPoint,
  FinancialOverview,
  InventoryAgingBucket,
  InventoryMetrics,
  InventoryReportRow,
  MarginAnalysisPoint,
  ProductPerformanceMetrics,
  ProductRankingRow,
  ProfitTrendPoint,
  PurchaseFrequencyPoint,
  PurchaseReportMetrics,
  PurchaseTrendPoint,
  SalesDetailRow,
  SalesMetrics,
  SalesPerformancePoint,
  ScheduledReport,
  SizeAnalysisPoint,
  SpendingDistributionPoint,
  StockDistributionPoint,
  StockMovementPoint,
  SupplierComparisonPoint,
  SupplierPerformanceRow,
} from "../types"

const now = Date.now()
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString()

export const executiveKpis: ExecutiveKpis = {
  totalRevenue: 2450000,
  revenueChangePercent: 18,
  grossProfit: 850000,
  grossMarginPercent: 35,
  totalOrders: 25400,
  customerGrowthPercent: 12,
}

export const salesPerformance: SalesPerformancePoint[] = [
  { period: "Feb", target: 380000, actual: 365000 },
  { period: "Mar", target: 390000, actual: 402000 },
  { period: "Apr", target: 400000, actual: 415000 },
  { period: "May", target: 410000, actual: 398000 },
  { period: "Jun", target: 420000, actual: 445000 },
  { period: "Jul", target: 430000, actual: 425000 },
]

export const inventoryHealth: ExecutiveInventoryHealth = {
  totalStockValue: 2174500,
  fastMovingCount: 84,
  slowMovingCount: 37,
  deadStockCount: 12,
}

export const salesMetrics: SalesMetrics = {
  totalSales: 128450,
  orderCount: 1542,
  averageOrderValue: 83.3,
  discountAmount: 8420,
  returnAmount: 3150,
  netSales: 116880,
}

export const revenueTrendByGranularity = {
  daily: [
    { period: "Mon", revenue: 4200 },
    { period: "Tue", revenue: 3800 },
    { period: "Wed", revenue: 5100 },
    { period: "Thu", revenue: 4600 },
    { period: "Fri", revenue: 6200 },
    { period: "Sat", revenue: 7400 },
    { period: "Sun", revenue: 5900 },
  ],
  weekly: [
    { period: "Week 1", revenue: 28500 },
    { period: "Week 2", revenue: 31200 },
    { period: "Week 3", revenue: 27800 },
    { period: "Week 4", revenue: 33900 },
  ],
  monthly: [
    { period: "Feb", revenue: 98000 },
    { period: "Mar", revenue: 105000 },
    { period: "Apr", revenue: 112000 },
    { period: "May", revenue: 108500 },
    { period: "Jun", revenue: 121000 },
    { period: "Jul", revenue: 118400 },
  ],
}

export const categorySales = [
  { category: "Men", amount: 42000 },
  { category: "Women", amount: 51500 },
  { category: "Kids", amount: 18200 },
  { category: "Accessories", amount: 16750 },
]

export const paymentMethodSales = [
  { method: "Cash", amount: 38500 },
  { method: "Card", amount: 52400 },
  { method: "Transfer", amount: 21300 },
  { method: "Mobile", amount: 16250 },
]

export const salesDetailRows: SalesDetailRow[] = [
  { id: "sd-1", date: daysAgo(1), invoiceNumber: "SINV-2026-1202", customerName: "Min Thu", productName: "Wool Blend Coat", amount: 139.32, discount: 0, paymentMethod: "Bank Transfer", salesPerson: "Sales Associate" },
  { id: "sd-2", date: daysAgo(3), invoiceNumber: "SINV-2026-1201", customerName: "Aye Chan Moe", productName: "Floral Summer Dress", amount: 136.88, discount: 10, paymentMethod: "Card", salesPerson: "Cashier" },
  { id: "sd-3", date: daysAgo(9), invoiceNumber: "SINV-2026-1195", customerName: "Kyaw Zin Htet", productName: "Nike Classic Tee", amount: 108, discount: 5, paymentMethod: "Cash", salesPerson: "Cashier" },
  { id: "sd-4", date: daysAgo(15), invoiceNumber: "SINV-2026-1180", customerName: "Su Su Aung", productName: "Leather Belt", amount: 27, discount: 0, paymentMethod: "Cash", salesPerson: "Cashier" },
]

export const inventoryMetrics: InventoryMetrics = {
  totalStockValue: 2174500,
  availableQuantity: 8420,
  lowStockCount: 245,
  deadStockCount: 35,
  fastMovingCount: 84,
  slowMovingCount: 37,
}

export const stockDistributionByWarehouse: StockDistributionPoint[] = [
  { label: "Yangon Warehouse", value: 812500 },
  { label: "Mandalay Warehouse", value: 340000 },
  { label: "Bangkok Warehouse", value: 976000 },
  { label: "Chiang Mai Warehouse", value: 45000 },
]

export const stockDistributionByCategory: StockDistributionPoint[] = [
  { label: "Men", value: 340 },
  { label: "Women", value: 63 },
  { label: "Kids", value: 450 },
  { label: "Accessories", value: 210 },
]

export const stockDistributionByBrand: StockDistributionPoint[] = [
  { label: "Nike", value: 218 },
  { label: "Zara", value: 45 },
  { label: "H&M", value: 460 },
  { label: "Guess", value: 210 },
  { label: "Mango", value: 18 },
]

export const stockMovementTrend: StockMovementPoint[] = [
  { period: "Mon", incoming: 120, outgoing: 80, adjustment: -2 },
  { period: "Tue", incoming: 60, outgoing: 95, adjustment: 0 },
  { period: "Wed", incoming: 90, outgoing: 70, adjustment: -5 },
  { period: "Thu", incoming: 40, outgoing: 110, adjustment: 0 },
  { period: "Fri", incoming: 150, outgoing: 60, adjustment: 3 },
  { period: "Sat", incoming: 30, outgoing: 130, adjustment: 0 },
  { period: "Sun", incoming: 20, outgoing: 40, adjustment: -1 },
]

export const inventoryAging: InventoryAgingBucket[] = [
  { bucket: "0-30", quantity: 6200 },
  { bucket: "30-90", quantity: 1780 },
  { bucket: "90+", quantity: 440 },
]

export const inventoryReportRows: InventoryReportRow[] = [
  { id: "ir-1", productName: "Nike Classic Tee", sku: "NIKE-TS-BLK-M-001", variantLabel: "Black / M", warehouseName: "Yangon Warehouse", quantity: 120, cost: 20, value: 2400, status: "available" },
  { id: "ir-2", productName: "Nike Classic Tee", sku: "NIKE-TS-BLK-L-001", variantLabel: "Black / L", warehouseName: "Yangon Warehouse", quantity: 18, cost: 20, value: 360, status: "low_stock" },
  { id: "ir-3", productName: "Floral Summer Dress", sku: "ZARA-FD-RED-S-014", variantLabel: "Red / S", warehouseName: "Bangkok Warehouse", quantity: 0, cost: 30, value: 0, status: "out_of_stock" },
  { id: "ir-4", productName: "Kids Graphic Tee", sku: "HM-KT-022", warehouseName: "Mandalay Warehouse", quantity: 450, cost: 8, value: 3600, status: "available" },
  { id: "ir-5", productName: "Wool Blend Coat", sku: "MANGO-WC-BLK-M-009", variantLabel: "Black / M", warehouseName: "Bangkok Warehouse", quantity: 18, cost: 60, value: 1080, status: "dead_stock" },
]

export const purchaseReportMetrics: PurchaseReportMetrics = {
  totalPurchase: 350000,
  supplierCount: 4,
  pendingOrders: 25,
  averageCost: 22.5,
}

export const supplierPerformanceRows: SupplierPerformanceRow[] = [
  { supplierId: "sup-1", supplierName: "Nike Apparel Co.", purchaseAmount: 185000, deliveryRatePercent: 97, qualityScore: 4.6, paymentStatus: "partial" },
  { supplierId: "sup-2", supplierName: "Zara Textile Group", purchaseAmount: 98000, deliveryRatePercent: 92, qualityScore: 4.2, paymentStatus: "unpaid" },
  { supplierId: "sup-3", supplierName: "Bangkok Fabric Mills", purchaseAmount: 42000, deliveryRatePercent: 88, qualityScore: 3.9, paymentStatus: "unpaid" },
  { supplierId: "sup-4", supplierName: "H&M Sourcing Partner", purchaseAmount: 25000, deliveryRatePercent: 85, qualityScore: 3.7, paymentStatus: "paid" },
]

export const purchaseTrend: PurchaseTrendPoint[] = [
  { period: "Feb", amount: 62000 },
  { period: "Mar", amount: 58000 },
  { period: "Apr", amount: 71000 },
  { period: "May", amount: 65000 },
  { period: "Jun", amount: 80000 },
  { period: "Jul", amount: 74000 },
]

export const supplierComparison: SupplierComparisonPoint[] = supplierPerformanceRows.map((s) => ({
  supplierName: s.supplierName,
  amount: s.purchaseAmount,
}))

export const costChangeAnalysis: CostChangePoint[] = [
  { productName: "Nike Classic Tee", previousCost: 18, currentCost: 20 },
  { productName: "Floral Summer Dress", previousCost: 32, currentCost: 30 },
  { productName: "Leather Belt", previousCost: 11, currentCost: 12 },
]

export const customerInsightMetrics: CustomerInsightMetrics = {
  totalCustomers: 5,
  newCustomers: 18,
  returningCustomers: 64,
  vipCustomers: 2,
  customerLifetimeValue: 890,
}

export const customerSegments: CustomerSegmentPoint[] = [
  { segment: "vip", count: 2 },
  { segment: "regular", count: 2 },
  { segment: "new", count: 1 },
  { segment: "inactive", count: 1 },
]

export const customerGrowth: CustomerGrowthPoint[] = [
  { period: "Feb", newCustomers: 12, totalCustomers: 210 },
  { period: "Mar", newCustomers: 15, totalCustomers: 225 },
  { period: "Apr", newCustomers: 9, totalCustomers: 234 },
  { period: "May", newCustomers: 18, totalCustomers: 252 },
  { period: "Jun", newCustomers: 22, totalCustomers: 274 },
  { period: "Jul", newCustomers: 18, totalCustomers: 292 },
]

export const purchaseFrequency: PurchaseFrequencyPoint[] = [
  { bucket: "1 order", customerCount: 120 },
  { bucket: "2-5 orders", customerCount: 98 },
  { bucket: "6-10 orders", customerCount: 42 },
  { bucket: "10+ orders", customerCount: 32 },
]

export const spendingDistribution: SpendingDistributionPoint[] = [
  { bucket: "$0-100", customerCount: 140 },
  { bucket: "$100-500", customerCount: 95 },
  { bucket: "$500-1000", customerCount: 38 },
  { bucket: "$1000+", customerCount: 19 },
]

export const productPerformanceMetrics: ProductPerformanceMetrics = {
  topSellingCount: 5,
  highestProfitCount: 5,
  slowMovingCount: 3,
  outOfStockCount: 1,
}

export const productRankings: ProductRankingRow[] = [
  { productName: "Nike Classic Tee", unitsSold: 320, revenue: 11200, profitMargin: 42.9 },
  { productName: "Floral Summer Dress", unitsSold: 145, revenue: 9860, profitMargin: 55.9 },
  { productName: "Leather Belt", unitsSold: 210, revenue: 5250, profitMargin: 52 },
  { productName: "Wool Blend Coat", unitsSold: 38, revenue: 4902, profitMargin: 53.5 },
  { productName: "Kids Graphic Tee", unitsSold: 12, revenue: 180, profitMargin: 46.7 },
]

export const sizeAnalysis: SizeAnalysisPoint[] = [
  { size: "M", percentSold: 45 },
  { size: "L", percentSold: 35 },
  { size: "XL", percentSold: 20 },
]

export const colorAnalysis: ColorAnalysisPoint[] = [
  { color: "Black", percentSold: 38 },
  { color: "White", percentSold: 26 },
  { color: "Blue", percentSold: 21 },
  { color: "Red", percentSold: 15 },
]

export const financialOverview: FinancialOverview = {
  revenue: 2450000,
  costOfGoodsSold: 1225000,
  grossProfit: 1225000,
  expenses: 375000,
  netProfit: 850000,
}

export const profitTrend: ProfitTrendPoint[] = [
  { period: "Feb", profit: 128000 },
  { period: "Mar", profit: 135000 },
  { period: "Apr", profit: 142000 },
  { period: "May", profit: 138000 },
  { period: "Jun", profit: 151000 },
  { period: "Jul", profit: 146000 },
]

export const expenseBreakdown: ExpenseBreakdownPoint[] = [
  { category: "Rent", amount: 120000 },
  { category: "Salaries", amount: 180000 },
  { category: "Marketing", amount: 45000 },
  { category: "Utilities", amount: 18000 },
  { category: "Other", amount: 12000 },
]

export const marginAnalysis: MarginAnalysisPoint[] = [
  { period: "Feb", grossMarginPercent: 50, netMarginPercent: 33 },
  { period: "Mar", grossMarginPercent: 51, netMarginPercent: 34 },
  { period: "Apr", grossMarginPercent: 50, netMarginPercent: 35 },
  { period: "May", grossMarginPercent: 49, netMarginPercent: 33 },
  { period: "Jun", grossMarginPercent: 52, netMarginPercent: 36 },
  { period: "Jul", grossMarginPercent: 50, netMarginPercent: 34 },
]

export const mockScheduledReports: ScheduledReport[] = [
  {
    id: "sched-1",
    reportType: "sales",
    frequency: "daily",
    recipientEmail: "manager@fashionerp.example",
    format: "pdf",
    time: "08:00",
    isActive: true,
    lastSentAt: daysAgo(1),
  },
  {
    id: "sched-2",
    reportType: "inventory",
    frequency: "weekly",
    recipientEmail: "warehouse@fashionerp.example",
    format: "excel",
    time: "07:00",
    isActive: true,
    lastSentAt: daysAgo(4),
  },
  {
    id: "sched-3",
    reportType: "finance",
    frequency: "monthly",
    recipientEmail: "finance@fashionerp.example",
    format: "pdf",
    time: "09:00",
    isActive: false,
  },
]
