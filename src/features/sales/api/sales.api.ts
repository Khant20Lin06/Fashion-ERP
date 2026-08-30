import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { resolveCompanyCurrency } from "@/lib/api/resolve-company-currency"
import { resolveBranchId as resolveOrgBranchId, resolveWarehouseId as resolveOrgWarehouseId } from "@/lib/api/resolve-org-ids"
import { toApiError } from "@/lib/api/errors"
import type {
  CustomerAnalyticsSummary,
  ProductPerformancePoint,
  ProductPerformanceSummary,
  RevenueTrendGranularity,
  RevenueTrendPoint,
  SalesItemPricingPreview,
  SalesReportFilters,
  SalesKpis,
  SalesOrder,
  SalesPriceListOption,
  SalesOrderStatus,
} from "../types"
import type { SalesOrderFormValues } from "../schemas/sales.schema"
import {
  mockCustomers,
  mockSalesOrders,
} from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function computeLineTotal(quantity: number, price: number, discount: number, tax: number) {
  return quantity * price - discount + tax
}

// ---------- Backend Types ----------
export type BackendSaleItem = {
  id: string
  saleId: string
  productVariantId: string
  quantity: number
  uomId?: string | null
  uomCodeSnapshot?: string | null
  uomNameSnapshot?: string | null
  unitPriceSnapshot: string
  discountSnapshot: string
  taxSnapshot: string
  lineTotal: string
  productNameSnapshot: string
  skuSnapshot: string
}

export type BackendSale = {
  id: string
  saleNumber: string
  saleType: string
  customerId: string
  salesAccountId: string | null
  companyId: string
  branchId: string | null
  warehouseId: string | null
  transactionDate: string
  status: string
  subtotal: string
  discountAmount: string
  taxAmount: string
  grandTotal: string
  currency: string
  notes: string | null
  createdAt: string
  updatedAt: string
  items?: BackendSaleItem[]
}

type BackendSalesPriceListOption = {
  id: string
  code: string
  name: string
  currency: string
}

type BackendSalesItemPricingPreview = {
  productVariantId: string
  priceListId: string
  uomId: string | null
  uomCode: string | null
  uomName: string | null
  quantity: number
  baseQuantity: number
  conversionFactorToBase: string
  unitPrice: string
  transactionDate: string
}

// ---------- Helper for resolving branch/warehouse IDs ----------
// Delegates to the shared resolve-org-ids helpers (already used by POS
// checkout in invoice.api.ts) instead of an unscoped "first result from
// GET /warehouses" pick — that arbitrary pick determined which physical
// warehouse's stock a sale would decrement, with no companyId scoping and
// no active-status filtering.
async function resolveBranchId(companyId: string | undefined): Promise<string | undefined> {
  if (!companyId) return undefined
  try {
    return await resolveOrgBranchId(companyId)
  } catch {
    return undefined
  }
}

async function resolveWarehouseId(companyId: string | undefined): Promise<string | undefined> {
  if (!companyId) return undefined
  try {
    return await resolveOrgWarehouseId(companyId)
  } catch {
    return undefined
  }
}

// ---------- Mapper ----------
function mapBackendSaleToOrder(sale: BackendSale, customers: Array<{ id: string, name: string }> = []): SalesOrder {
  const statusMap: Record<string, SalesOrderStatus> = {
    DRAFT: "draft",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
  }

  const items =
    sale.items?.map((item, index) => ({
      id: item.id || `item-${index}`,
      productId: item.productVariantId,
      productName: item.productNameSnapshot || item.productVariantId,
      sku: item.skuSnapshot || item.productVariantId,
      uomId: item.uomId ?? undefined,
      uomLabel: item.uomNameSnapshot ?? item.uomCodeSnapshot ?? undefined,
      quantity: item.quantity,
      price: Number(item.unitPriceSnapshot || 0),
      discount: Number(item.discountSnapshot || 0),
      tax: Number(item.taxSnapshot || 0),
      total: Number(item.lineTotal || 0),
    })) || []

  const customerName = customers.find((c) => c.id === sale.customerId)?.name ?? "Walk-in Customer"

  return {
    id: sale.id,
    orderNumber: sale.saleNumber,
    customerId: sale.customerId,
    customerName,
    priceListId: undefined,
    items,
    deliveryDate: sale.transactionDate,
    paymentTerms: "Immediate",
    notes: sale.notes || undefined,
    status: statusMap[sale.status] || "draft",
    subtotal: Number(sale.subtotal || 0),
    discountTotal: Number(sale.discountAmount || 0),
    taxTotal: Number(sale.taxAmount || 0),
    grandTotal: Number(sale.grandTotal || 0),
    createdAt: sale.createdAt,
  }
}

// --- Sales Orders ---

export async function fetchSalesOrders(companyId?: string): Promise<SalesOrder[]> {
  if (USE_MOCK) return delay(mockSalesOrders)
  
  const resolvedCompanyId = await resolveCompanyId(companyId)
  const [salesRes, customersRes] = await Promise.all([
    apiClient.get<{ data: BackendSale[] }>("/sales", {
      params: { companyId: resolvedCompanyId, limit: 100 },
    }),
    apiClient.get<{ data: Array<{ id: string, name: string }> }>("/customers", {
      params: { companyId: resolvedCompanyId },
    })
  ])

  const sales = salesRes.data.data ?? []
  const customers = customersRes.data.data ?? []

  // Load items details for each sale
  const salesWithItems = await Promise.all(
    sales.map(async (sale) => {
      try {
        const { data: saleDetail } = await apiClient.get<BackendSale>(`/sales/${sale.id}`, { params: { companyId: resolvedCompanyId } })
        return saleDetail
      } catch {
        return sale
      }
    })
  )

  return salesWithItems.map((sale) => mapBackendSaleToOrder(sale, customers))
}

export async function fetchSalesOrderById(id: string, companyId?: string): Promise<SalesOrder | undefined> {
  if (USE_MOCK) return delay(mockSalesOrders.find((o) => o.id === id))
  
  const resolvedCompanyId = await resolveCompanyId(companyId)
  const [saleRes, customersRes] = await Promise.all([
    apiClient.get<BackendSale>(`/sales/${id}`, {
      params: { companyId: resolvedCompanyId },
    }),
    apiClient.get<{ data: Array<{ id: string, name: string }> }>("/customers", {
      params: { companyId: resolvedCompanyId },
    })
  ])

  return mapBackendSaleToOrder(saleRes.data, customersRes.data.data ?? [])
}

export async function fetchSalesPriceLists(companyId?: string): Promise<SalesPriceListOption[]> {
  if (USE_MOCK) {
    return delay([
      { id: "price-list-retail", code: "RETAIL", name: "Retail Selling Price", currency: "USD" },
      { id: "price-list-wholesale", code: "WHOLESALE", name: "Wholesale Price List", currency: "USD" },
    ])
  }

  const resolvedCompanyId = await resolveCompanyId(companyId)
  const { data } = await apiClient.get<BackendSalesPriceListOption[]>("/sales/pricing/price-lists", {
    params: { companyId: resolvedCompanyId },
  })
  return (data ?? []).map(mapSalesPriceListOption)
}

export async function previewSalesItemPricing(
  values: {
    productVariantId: string
    quantity: number
    uomId?: string
    priceListId?: string
    transactionDate?: string
  },
  companyId?: string,
): Promise<SalesItemPricingPreview> {
  if (USE_MOCK) {
    return delay({
      productVariantId: values.productVariantId,
      priceListId: values.priceListId ?? "price-list-retail",
      uomId: values.uomId,
      uomCode: undefined,
      uomName: undefined,
      quantity: values.quantity,
      baseQuantity: values.quantity,
      conversionFactorToBase: "1.0000",
      unitPrice: 100,
      transactionDate: values.transactionDate ?? new Date().toISOString(),
    })
  }

  const resolvedCompanyId = await resolveCompanyId(companyId)
  const { data } = await apiClient.post<BackendSalesItemPricingPreview>("/sales/pricing/preview", {
    companyId: resolvedCompanyId,
    productVariantId: values.productVariantId,
    quantity: values.quantity,
    uomId: values.uomId || undefined,
    priceListId: values.priceListId || undefined,
    transactionDate: values.transactionDate || undefined,
  })
  return mapSalesItemPricingPreview(data)
}

export async function createSalesOrder(values: SalesOrderFormValues, companyId?: string): Promise<SalesOrder> {
  if (USE_MOCK) {
    const customer = mockCustomers.find((c) => c.id === values.customerId)
    const items = values.items.map((item, index) => ({
      id: `soi-${Date.now()}-${index}`,
      ...item,
      total: computeLineTotal(item.quantity, item.price, item.discount, item.tax),
    }))
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0)
    const discountTotal = items.reduce((sum, i) => sum + i.discount, 0)
    const taxTotal = items.reduce((sum, i) => sum + i.tax, 0)
    return delay({
      id: `so-${Date.now()}`,
      orderNumber: `SO-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      customerId: values.customerId,
      customerName: customer?.name ?? "",
      priceListId: values.priceListId || undefined,
      items,
      deliveryDate: values.deliveryDate,
      paymentTerms: values.paymentTerms,
      notes: values.notes,
      status: "draft",
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal: subtotal - discountTotal + taxTotal,
      createdAt: new Date().toISOString(),
    })
  }

  const resolvedCompanyId = await resolveCompanyId(companyId)
  const branchId = await resolveBranchId(resolvedCompanyId)
  const warehouseId = await resolveWarehouseId(resolvedCompanyId)
  const currency = resolvedCompanyId ? await resolveCompanyCurrency(resolvedCompanyId) : "USD"

  const payload = {
    companyId: resolvedCompanyId,
    branchId,
    warehouseId,
    customerId: values.customerId,
    saleType: "RETAIL",
    currency,
    notes: values.notes,
    transactionDate: values.deliveryDate ? new Date(values.deliveryDate).toISOString() : new Date().toISOString(),
    items: values.items.map((item) => ({
      productVariantId: item.productId,
      uomId: item.uomId || undefined,
      priceListId: values.priceListId || undefined,
      quantity: item.quantity,
      discountAmount: String(item.discount || 0),
      taxAmount: String(item.tax || 0),
    })),
  }

  const { data } = await apiClient.post<BackendSale>("/sales", payload)

  // Fetch customer details to get name
  const customersRes = await apiClient.get<{ data: Array<{ id: string, name: string }> }>("/customers", { params: { companyId: resolvedCompanyId } })

  return mapBackendSaleToOrder(data, customersRes.data.data ?? [])
}

export async function confirmSalesOrder(id: string, companyId?: string): Promise<SalesOrder> {
  if (USE_MOCK) {
    const existing = mockSalesOrders.find((o) => o.id === id)
    if (!existing) throw new Error("Sales order not found")
    return delay({ ...existing, status: "confirmed" })
  }
  const resolvedCompanyId = await resolveCompanyId(companyId)
  const { data } = await apiClient.post<BackendSale>(`/sales/${id}/confirm`, null, {
    params: { companyId: resolvedCompanyId },
  })
  
  const customersRes = await apiClient.get<{ data: Array<{ id: string, name: string }> }>("/customers", { params: { companyId: resolvedCompanyId } })
  return mapBackendSaleToOrder(data, customersRes.data.data ?? [])
}

export async function cancelSalesOrder(id: string, companyId?: string): Promise<SalesOrder> {
  if (USE_MOCK) {
    const existing = mockSalesOrders.find((o) => o.id === id)
    if (!existing) throw new Error("Sales order not found")
    return delay({ ...existing, status: "cancelled" })
  }
  const resolvedCompanyId = await resolveCompanyId(companyId)
  const { data } = await apiClient.post<BackendSale>(`/sales/${id}/cancel`, null, {
    params: { companyId: resolvedCompanyId },
  })

  const customersRes = await apiClient.get<{ data: Array<{ id: string, name: string }> }>("/customers", { params: { companyId: resolvedCompanyId } })
  return mapBackendSaleToOrder(data, customersRes.data.data ?? [])
}

export async function updateSalesOrderStatus(id: string, status: SalesOrderStatus, companyId?: string): Promise<SalesOrder> {
  if (status === "confirmed") {
    return confirmSalesOrder(id, companyId)
  }
  if (status === "cancelled") {
    return cancelSalesOrder(id, companyId)
  }
  const order = await fetchSalesOrderById(id, companyId)
  if (!order) throw new Error("Sales order not found")
  return order
}

// --- Dashboard / Analytics ---

// Shapes returned by the real backend report endpoints (see
// src/modules/reports/services/sales-reports.service.ts on the backend for
// SalesSummary / SalesByDateRow / SalesByCustomerRow — these are plain
// analytics rows, not paginated {data,meta} collections, unlike the CRUD
// list endpoints elsewhere in this codebase).
interface BackendSalesSummary {
  grandTotal?: string | number
  saleCount?: number
}
interface BackendSalesByDateRow {
  date?: string
  period?: string
  grandTotal?: string | number
  revenue?: string | number
}
// The real backend row (see erp-pos fashion api
// src/modules/reports/services/sales-reports.service.ts SalesByProductRow)
// has only these three fields — no profitMargin. There's no cost-of-goods
// accounting on this endpoint, so a margin figure would have to be
// fabricated client-side; it is intentionally not computed or displayed.
interface BackendSalesByProductRow {
  productName?: string
  unitsSold?: number
  revenue?: string | number
}
interface BackendSalesByCustomerRow {
  customerId: string
  customerCode: string
  customerName: string
  saleCount: number
  grandTotal: string
}

interface BackendSalesCustomerSummary {
  newCustomers: number
  returningCustomers: number
  averageCustomerSpend: string | number
}

function buildSalesReportParams(companyId: string, filters?: SalesReportFilters, extra?: Record<string, string | number | undefined>) {
  return {
    companyId,
    branchId: filters?.branchId,
    fromDate: filters?.fromDate,
    toDate: filters?.toDate,
    ...extra,
  }
}

function mapSalesPriceListOption(entry: BackendSalesPriceListOption): SalesPriceListOption {
  return {
    id: entry.id,
    code: entry.code,
    name: entry.name,
    currency: entry.currency,
  }
}

function mapSalesItemPricingPreview(entry: BackendSalesItemPricingPreview): SalesItemPricingPreview {
  return {
    productVariantId: entry.productVariantId,
    priceListId: entry.priceListId,
    uomId: entry.uomId ?? undefined,
    uomCode: entry.uomCode ?? undefined,
    uomName: entry.uomName ?? undefined,
    quantity: entry.quantity,
    baseQuantity: entry.baseQuantity,
    conversionFactorToBase: entry.conversionFactorToBase,
    unitPrice: Number(entry.unitPrice),
    transactionDate: entry.transactionDate,
  }
}

// These four functions intentionally do NOT catch-and-return zeroed data on
// failure (a prior version did, which silently rendered "0 sales today" on
// any network/auth/server error — indistinguishable from a real slow day).
// Real failures now propagate to React Query, whose consuming components
// surface `isError` via ErrorState + retry instead of masking it.

export async function fetchSalesKpis(): Promise<SalesKpis> {
  const companyId = await resolveCompanyId()
  const todayStr = new Date().toISOString().split("T")[0] // "2026-08-15"
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]

  const [todayRes, monthRes, customersRes] = await Promise.all([
    apiClient.get<BackendSalesSummary>("/reports/sales/summary", {
      params: { companyId, fromDate: `${todayStr}T00:00:00.000Z`, toDate: `${todayStr}T23:59:59.999Z` },
    }),
    apiClient.get<BackendSalesSummary>("/reports/sales/summary", {
      params: { companyId, fromDate: `${firstDayOfMonth}T00:00:00.000Z` },
    }),
    apiClient.get<{ data: unknown[] }>("/customers", {
      params: { companyId },
    }),
  ])

  const todaySales = Number(todayRes.data?.grandTotal || 0)
  const monthSales = Number(monthRes.data?.grandTotal || 0)
  const totalOrders = Number(monthRes.data?.saleCount || 0)
  const totalCustomers = customersRes.data?.data?.length || 0

  return {
    todaysSales: todaySales,
    todaysSalesChangePercent: todaySales > 0 ? 100 : 0,
    monthlyRevenue: monthSales,
    orders: totalOrders,
    customers: totalCustomers,
  }
}

export async function fetchRevenueTrend(
  granularity: RevenueTrendGranularity,
  filters?: SalesReportFilters,
): Promise<RevenueTrendPoint[]> {
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<BackendSalesByDateRow[]>("/reports/sales/by-date", {
    params: buildSalesReportParams(companyId, filters, { granularity }),
  })
  return data.map((item) => {
    const dateVal = item.date || item.period || ""
    let formattedPeriod = dateVal
    const d = new Date(dateVal)
    if (!isNaN(d.getTime())) {
      formattedPeriod =
        granularity === "monthly"
          ? d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
          : granularity === "yearly"
            ? d.toLocaleDateString("en-US", { year: "numeric" })
            : d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
    return {
      period: formattedPeriod,
      revenue: Number(item.revenue || item.grandTotal || 0),
    }
  })
}

export async function fetchProductPerformance(filters?: SalesReportFilters): Promise<ProductPerformanceSummary> {
  const companyId = await resolveCompanyId()
  const mapRow = (item: BackendSalesByProductRow): ProductPerformancePoint => ({
    productName: item.productName || "",
    unitsSold: Number(item.unitsSold || 0),
    revenue: Number(item.revenue || 0),
  })
  try {
    const [topSellingRes, slowMovingRes] = await Promise.all([
      apiClient.get<BackendSalesByProductRow[]>("/reports/sales/by-product", {
        params: buildSalesReportParams(companyId, filters, {
          sortBy: "unitsSold",
          sortDirection: "DESC",
          limit: 5,
        }),
      }),
      apiClient.get<BackendSalesByProductRow[]>("/reports/sales/by-product", {
        params: buildSalesReportParams(companyId, filters, {
          sortBy: "unitsSold",
          sortDirection: "ASC",
          limit: 5,
        }),
      }),
    ])

    return {
      topSelling: topSellingRes.data.map(mapRow),
      slowMoving: slowMovingRes.data.map(mapRow),
    }
  } catch (error) {
    const apiError = toApiError(error)
    if (apiError.isForbidden || apiError.isUnauthorized) throw apiError

    const { data } = await apiClient.get<BackendSalesByProductRow[]>("/reports/sales/by-product", {
      params: buildSalesReportParams(companyId, filters),
    })
    const rows = data.map(mapRow).sort((a, b) => b.unitsSold - a.unitsSold)
    return {
      topSelling: rows.slice(0, 5),
      slowMoving: rows.slice(-5).reverse(),
    }
  }
}

export async function fetchCustomerAnalyticsSummary(filters?: SalesReportFilters): Promise<CustomerAnalyticsSummary> {
  const companyId = await resolveCompanyId()
  try {
    const { data } = await apiClient.get<BackendSalesCustomerSummary>("/reports/sales/customer-summary", {
      params: buildSalesReportParams(companyId, filters),
    })
    return {
      newCustomers: Number(data.newCustomers || 0),
      returningCustomers: Number(data.returningCustomers || 0),
      averageCustomerSpend: Number(data.averageCustomerSpend || 0),
    }
  } catch (error) {
    const apiError = toApiError(error)
    if (apiError.isForbidden || apiError.isUnauthorized) throw apiError

    const { data } = await apiClient.get<BackendSalesByCustomerRow[]>("/reports/sales/by-customer", {
      params: buildSalesReportParams(companyId, filters),
    })
    const totalRevenue = data.reduce((sum, row) => sum + Number(row.grandTotal || 0), 0)
    const newCustomers = data.filter((row) => Number(row.saleCount || 0) <= 1).length
    return {
      newCustomers,
      returningCustomers: Math.max(data.length - newCustomers, 0),
      averageCustomerSpend: data.length > 0 ? totalRevenue / data.length : 0,
    }
  }
}
