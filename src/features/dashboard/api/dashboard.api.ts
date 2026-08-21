import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type {
  CategoryBreakdownPoint,
  DashboardSummary,
  KpiMetric,
  LowStockItem,
  RecentOrder,
  RevenuePoint,
  SalesTrendGranularity,
  SalesTrendPoint,
  StockDistributionPoint,
  TopProduct,
} from "../types"
import { getMockDashboardSummary } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

// ---------- Backend response types (exact shapes, see erp-pos fashion api reports module) ----------

type BackendDashboardSummary = {
  period: { fromDate: string | null; toDate: string | null }
  companyId: string
  branchId: string | null
  sales: { saleCount: number; grandTotal: string }
  purchases: { purchaseOrderCount: number; grandTotal: string }
  payments: { receiptCount: number; receiptTotal: string; paymentCount: number; paymentTotal: string }
  receivablesOutstanding: string
  payablesOutstanding: string
  inventory: { totalOnHandQuantity: number; distinctProductVariantCount: number }
  accounting: { totalDebit: string; totalCredit: string; balanced: boolean }
  asOfTimestamp: string
  cached: boolean
}

type BackendSalesByDateRow = { date: string; saleCount: number; grandTotal: string }

// No profitMargin field on the real backend row (see erp-pos fashion api
// SalesByProductRow) — there's no cost-of-goods-sold data behind this
// endpoint, so it's correctly not represented here.
type BackendTopProductRow = {
  productName: string
  unitsSold: number
  revenue: string
}

type BackendStockSummaryRow = {
  warehouseId: string
  warehouseName: string
  productVariantId: string
  sku: string
  onHandQuantity: number
  reservedQuantity: number
}

type BackendSale = {
  id: string
  saleNumber: string
  customerId: string
  transactionDate: string
  status: string
  grandTotal: string
}

// ---------- Mappers ----------

/**
 * Backend's `by-date` granularity parameter only accepts (and correctly
 * computes) "daily" — "monthly"/"weekly"/"yearly" trigger a 500 from a
 * MySQL ONLY_FULL_GROUP_BY incompatibility in the backend's own SQL
 * (confirmed live: erp-pos fashion api SalesReportsService.byDate, the
 * SELECT's DATE_FORMAT expression isn't provably functionally-dependent on
 * the GROUP BY expression under strict mode). This is a genuine backend
 * bug, not a frontend contract error — flagged, not silently patched
 * server-side. The frontend always requests real daily rows from the
 * backend and buckets them into weeks/months here — every number in a
 * bucket is still exactly what the backend computed for that day, this
 * only groups already-correct totals, it never recalculates one.
 */
function bucketSalesByDate(
  rows: BackendSalesByDateRow[],
  granularity: SalesTrendGranularity
): SalesTrendPoint[] {
  if (granularity === "daily") {
    return rows.map((row) => ({
      period: formatDayLabel(row.date),
      sales: Number(row.grandTotal),
      orders: row.saleCount,
    }))
  }

  const buckets = new Map<string, { sales: number; orders: number; sortKey: string }>()

  for (const row of rows) {
    const date = new Date(row.date)
    const bucketKey = granularity === "monthly" ? monthKey(date) : weekKey(date)
    const existing = buckets.get(bucketKey)
    const sales = Number(row.grandTotal)
    if (existing) {
      existing.sales += sales
      existing.orders += row.saleCount
    } else {
      buckets.set(bucketKey, { sales, orders: row.saleCount, sortKey: bucketKey })
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      period: granularity === "monthly" ? formatMonthLabel(key) : key,
      sales: value.sales,
      orders: value.orders,
    }))
}

function formatDayLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-")
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  })
}

function weekKey(date: Date): string {
  const firstDayOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const days = Math.floor((date.getTime() - firstDayOfYear.getTime()) / 86_400_000)
  const week = Math.ceil((days + firstDayOfYear.getUTCDay() + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`
}

function mapKpis(summary: BackendDashboardSummary): KpiMetric[] {
  return [
    {
      id: "today-revenue",
      label: "Total Sales",
      value: Number(summary.sales.grandTotal),
      format: "currency",
      comparisonLabel: "selected period",
    },
    {
      id: "total-orders",
      label: "Total Orders",
      value: summary.sales.saleCount,
      format: "number",
      comparisonLabel: "selected period",
    },
    {
      id: "total-products",
      label: "Units on Hand",
      value: summary.inventory.totalOnHandQuantity,
      format: "number",
      comparisonLabel: `${summary.inventory.distinctProductVariantCount} variants`,
    },
    {
      id: "pending-po",
      label: "Purchase Orders",
      value: summary.purchases.purchaseOrderCount,
      format: "number",
      comparisonLabel: "selected period",
    },
  ]
}

function mapRevenueTrend(salesTrend: SalesTrendPoint[]): RevenuePoint[] {
  // No separate "revenue" concept exists backend-side for this period view —
  // sales grandTotal is the real revenue figure. No `target` field exists
  // anywhere in the backend contract, so it's correctly omitted, not faked.
  return salesTrend.map((point) => ({ period: point.period, revenue: point.sales }))
}

function mapTopProducts(rows: BackendTopProductRow[]): TopProduct[] {
  return rows.map((row) => ({
    id: row.productName,
    name: row.productName,
    sku: "",
    category: "",
    unitsSold: row.unitsSold,
    revenue: Number(row.revenue),
  }))
}

function mapStockDistribution(rows: BackendStockSummaryRow[]): StockDistributionPoint[] {
  const byWarehouse = new Map<string, number>()
  for (const row of rows) {
    byWarehouse.set(row.warehouseName, (byWarehouse.get(row.warehouseName) ?? 0) + row.onHandQuantity)
  }
  return Array.from(byWarehouse.entries()).map(([warehouse, quantity]) => ({ warehouse, quantity }))
}

function mapRecentOrders(sales: BackendSale[], customers: Array<{ id: string; name: string }>): RecentOrder[] {
  const statusMap: Record<string, RecentOrder["status"]> = {
    DRAFT: "pending",
    CONFIRMED: "completed",
    CANCELLED: "cancelled",
  }
  return sales.map((sale) => ({
    id: sale.id,
    orderNumber: sale.saleNumber,
    customerName: customers.find((c) => c.id === sale.customerId)?.name ?? "Walk-in Customer",
    date: sale.transactionDate,
    total: Number(sale.grandTotal),
    status: statusMap[sale.status] ?? "pending",
    itemCount: 0, // not present on the list response; only fetchable via a per-sale detail call, too expensive for a 5-row widget
  }))
}

// ---------- API ----------

export async function fetchDashboardSummary(
  granularity: SalesTrendGranularity = "monthly"
): Promise<DashboardSummary> {
  if (USE_MOCK) {
    return getMockDashboardSummary(granularity)
  }

  const companyId = await resolveCompanyId()

  const [summaryRes, salesByDateRes, topProductsRes, stockSummaryRes, recentSalesRes] = await Promise.all([
    apiClient.get<BackendDashboardSummary>("/reports/dashboard", { params: { companyId } }),
    apiClient.get<BackendSalesByDateRow[]>("/reports/sales/by-date", {
      params: { companyId, granularity: "daily" },
    }),
    apiClient.get<BackendTopProductRow[]>("/reports/sales/by-product", { params: { companyId } }),
    apiClient.get<BackendStockSummaryRow[]>("/reports/inventory/stock-summary", { params: { companyId } }),
    apiClient.get<{ data: BackendSale[]; meta: unknown }>("/sales", {
      params: { companyId, limit: 5, sort: "transactionDate", order: "DESC" },
    }),
  ])

  const recentSales = recentSalesRes.data.data ?? []
  const customerIds = Array.from(new Set(recentSales.map((s) => s.customerId)))
  const customers = customerIds.length
    ? (
        await apiClient.get<{ data: Array<{ id: string; name: string }> }>("/customers", {
          params: { companyId },
        })
      ).data.data ?? []
    : []

  const salesTrend = bucketSalesByDate(salesByDateRes.data, granularity)

  // Confirmed BACKEND GAPS (searched the full reports module — no endpoint
  // provides these): reorder-level stock alerts, aggregate customer/loyalty
  // counts, category-level sales breakdown. Rather than fabricate numbers,
  // these render as empty — the widgets already have real, honest empty
  // states for exactly this case.
  const lowStockItems: LowStockItem[] = []
  const categoryBreakdown: CategoryBreakdownPoint[] = []

  return {
    kpis: mapKpis(summaryRes.data),
    revenueTrend: mapRevenueTrend(salesTrend),
    salesTrend,
    stockDistribution: mapStockDistribution(stockSummaryRes.data),
    categoryBreakdown,
    recentOrders: mapRecentOrders(recentSales, customers),
    topProducts: mapTopProducts(topProductsRes.data),
    lowStockItems,
    customerAnalytics: undefined,
  }
}
