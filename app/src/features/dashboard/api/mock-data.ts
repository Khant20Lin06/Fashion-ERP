import type {
  DashboardSummary,
  SalesTrendGranularity,
  SalesTrendPoint,
} from "../types"

const monthly: SalesTrendPoint[] = [
  { period: "Jan", sales: 84200, orders: 412 },
  { period: "Feb", sales: 91500, orders: 448 },
  { period: "Mar", sales: 87300, orders: 431 },
  { period: "Apr", sales: 102400, orders: 502 },
  { period: "May", sales: 118900, orders: 561 },
  { period: "Jun", sales: 128450, orders: 604 },
]

const weekly: SalesTrendPoint[] = [
  { period: "Wk 1", sales: 27800, orders: 138 },
  { period: "Wk 2", sales: 31200, orders: 149 },
  { period: "Wk 3", sales: 29650, orders: 142 },
  { period: "Wk 4", sales: 33500, orders: 161 },
]

const daily: SalesTrendPoint[] = [
  { period: "Mon", sales: 4200, orders: 21 },
  { period: "Tue", sales: 5100, orders: 26 },
  { period: "Wed", sales: 4800, orders: 24 },
  { period: "Thu", sales: 5600, orders: 28 },
  { period: "Fri", sales: 7200, orders: 35 },
  { period: "Sat", sales: 8900, orders: 44 },
  { period: "Sun", sales: 6100, orders: 30 },
]

const trendByGranularity: Record<SalesTrendGranularity, SalesTrendPoint[]> = {
  daily,
  weekly,
  monthly,
}

export function getMockDashboardSummary(
  granularity: SalesTrendGranularity
): DashboardSummary {
  return {
    kpis: [
      {
        id: "today-revenue",
        label: "Today's Revenue",
        value: 12845,
        format: "currency",
        changePercent: 8.2,
        trend: "up",
        comparisonLabel: "vs. yesterday",
      },
      {
        id: "monthly-revenue",
        label: "Monthly Revenue",
        value: 128450,
        format: "currency",
        changePercent: 12.5,
        trend: "up",
        comparisonLabel: "vs. last month",
      },
      {
        id: "total-orders",
        label: "Total Orders",
        value: 604,
        format: "number",
        changePercent: 6.4,
        trend: "up",
        comparisonLabel: "vs. last month",
      },
      {
        id: "avg-order-value",
        label: "Average Order Value",
        value: 212.6,
        format: "currency",
        changePercent: -1.8,
        trend: "down",
        comparisonLabel: "vs. last month",
      },
      {
        id: "total-products",
        label: "Total Products",
        value: 3420,
        format: "number",
        changePercent: 2.1,
        trend: "up",
        comparisonLabel: "vs. last month",
      },
      {
        id: "low-stock",
        label: "Low Stock Items",
        value: 18,
        format: "number",
        changePercent: 20,
        trend: "up",
        comparisonLabel: "vs. last week",
      },
      {
        id: "out-of-stock",
        label: "Out of Stock",
        value: 4,
        format: "number",
        changePercent: -33.3,
        trend: "down",
        comparisonLabel: "vs. last week",
      },
      {
        id: "stock-value",
        label: "Stock Value",
        value: 842000,
        format: "currency",
        changePercent: 3.4,
        trend: "up",
        comparisonLabel: "vs. last month",
      },
      {
        id: "total-customers",
        label: "Total Customers",
        value: 8120,
        format: "number",
        changePercent: 4.6,
        trend: "up",
        comparisonLabel: "vs. last month",
      },
      {
        id: "new-customers",
        label: "New Customers",
        value: 246,
        format: "number",
        changePercent: 15.2,
        trend: "up",
        comparisonLabel: "vs. last month",
      },
      {
        id: "loyalty-members",
        label: "Loyalty Members",
        value: 3980,
        format: "number",
        changePercent: 7.8,
        trend: "up",
        comparisonLabel: "vs. last month",
      },
      {
        id: "pending-po",
        label: "Pending Purchase Orders",
        value: 12,
        format: "number",
        changePercent: 0,
        trend: "flat",
        comparisonLabel: "vs. last week",
      },
    ],
    revenueTrend: monthly.map((m) => ({
      period: m.period,
      revenue: m.sales,
      target: Math.round(m.sales * 0.95),
    })),
    salesTrend: trendByGranularity[granularity],
    stockDistribution: [
      { warehouse: "Warehouse A", quantity: 12400 },
      { warehouse: "Warehouse B", quantity: 8900 },
      { warehouse: "Warehouse C", quantity: 5200 },
    ],
    categoryBreakdown: [
      { category: "Men", value: 38 },
      { category: "Women", value: 42 },
      { category: "Kids", value: 12 },
      { category: "Accessories", value: 8 },
    ],
    recentOrders: [
      { id: "1", orderNumber: "ORD-10234", customerName: "Sarah Chen", date: "2026-07-08T14:22:00Z", total: 284.5, status: "completed", itemCount: 3 },
      { id: "2", orderNumber: "ORD-10233", customerName: "Marcus Lee", date: "2026-07-08T13:05:00Z", total: 129.0, status: "processing", itemCount: 1 },
      { id: "3", orderNumber: "ORD-10232", customerName: "Priya Patel", date: "2026-07-08T11:47:00Z", total: 452.75, status: "completed", itemCount: 5 },
      { id: "4", orderNumber: "ORD-10231", customerName: "James Wood", date: "2026-07-08T10:12:00Z", total: 76.0, status: "pending", itemCount: 1 },
      { id: "5", orderNumber: "ORD-10230", customerName: "Nina Larsson", date: "2026-07-07T18:40:00Z", total: 198.2, status: "cancelled", itemCount: 2 },
      { id: "6", orderNumber: "ORD-10229", customerName: "Ali Hassan", date: "2026-07-07T16:15:00Z", total: 340.0, status: "refunded", itemCount: 4 },
    ],
    topProducts: [
      { id: "p1", name: "Classic Denim Jacket", sku: "DJ-001", category: "Men", unitsSold: 342, revenue: 46170 },
      { id: "p2", name: "Floral Summer Dress", sku: "FD-014", category: "Women", unitsSold: 298, revenue: 38740 },
      { id: "p3", name: "Kids Graphic Tee", sku: "KT-022", category: "Kids", unitsSold: 512, revenue: 12800 },
      { id: "p4", name: "Leather Belt", sku: "AC-007", category: "Accessories", unitsSold: 410, revenue: 10250 },
      { id: "p5", name: "Wool Blend Coat", sku: "WC-009", category: "Women", unitsSold: 156, revenue: 31200 },
    ],
    lowStockItems: [
      { id: "l1", name: "Nike Hoodie", sku: "NK-045", category: "Men", quantityRemaining: 5, reorderLevel: 20, warehouse: "Warehouse A" },
      { id: "l2", name: "Silk Scarf", sku: "AC-019", category: "Accessories", quantityRemaining: 3, reorderLevel: 15, warehouse: "Warehouse B" },
      { id: "l3", name: "Kids Rain Boots", sku: "KB-031", category: "Kids", quantityRemaining: 8, reorderLevel: 25, warehouse: "Warehouse C" },
      { id: "l4", name: "Slim Fit Chinos", sku: "CH-012", category: "Men", quantityRemaining: 6, reorderLevel: 20, warehouse: "Warehouse A" },
    ],
    customerAnalytics: {
      totalCustomers: 8120,
      newCustomersThisMonth: 246,
      loyaltyMembers: 3980,
      repeatPurchaseRate: 38.4,
      topSegments: [
        { segment: "VIP", count: 412 },
        { segment: "Regular", count: 4890 },
        { segment: "New", count: 2818 },
      ],
    },
  }
}
