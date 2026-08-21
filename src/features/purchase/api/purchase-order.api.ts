import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { resolveCompanyCurrency } from "@/lib/api/resolve-company-currency"
import { env } from "@/config/env"
import type {
  ProductCostPoint,
  PurchaseKpis,
  PurchaseLineItem,
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseRequest,
  PurchaseTrendPoint,
} from "../types"
import type { PurchaseOrderFormValues, PurchaseRequestFormValues } from "../schemas/purchase.schema"
import {
  mockPurchaseOrders,
  mockPurchaseRequests,
  mockSuppliers,
  productCostAnalysis,
  purchaseTrend,
} from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function computeLineAmount(quantity: number, unitCost: number, discount: number, tax: number) {
  return quantity * unitCost - discount + tax
}

// --- Purchase Requests ---
// No backend module exists for a pre-PO "purchase request"/approval
// workflow in Phase 00-31 (purchase-orders.controller.ts's own comment
// confirms approval workflow is explicitly out of scope) — mock-only until
// a real endpoint exists.

export async function fetchPurchaseRequests(): Promise<PurchaseRequest[]> {
  if (USE_MOCK) return delay(mockPurchaseRequests)
  return []
}

export async function createPurchaseRequest(values: PurchaseRequestFormValues): Promise<PurchaseRequest> {
  if (USE_MOCK) {
    return delay({
      id: `pr-${Date.now()}`,
      reference: `PR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      department: values.department,
      requester: values.requester,
      requiredDate: values.requiredDate,
      status: "draft",
      items: values.items.map((item, index) => ({ id: `pri-${Date.now()}-${index}`, ...item })),
      notes: values.notes,
      createdAt: new Date().toISOString(),
    })
  }
  throw new Error("Purchase requests are not available yet.")
}

export async function updatePurchaseRequestStatus(id: string, status: PurchaseRequest["status"]): Promise<PurchaseRequest> {
  if (USE_MOCK) {
    const existing = mockPurchaseRequests.find((r) => r.id === id)
    if (!existing) throw new Error("Purchase request not found")
    return delay({ ...existing, status })
  }
  throw new Error("Purchase requests are not available yet.")
}

// --- Purchase Orders ---
// Real controller: @Controller('purchase-orders') — NOT /purchase/orders.
// Phase 13 is a deliberately locked 3-state lifecycle (DRAFT/CONFIRMED/
// CANCELLED, see PurchaseOrderStatus on the backend) with no generic status
// PATCH — only POST :id/confirm and POST :id/cancel. The richer frontend
// status set (pending_approval/partially_received/received) has no backend
// equivalent yet and is mapped down to the closest real state.

type BackendPurchaseOrderStatus = "DRAFT" | "CONFIRMED" | "CANCELLED"

type BackendPurchaseOrderItem = {
  id: string
  purchaseOrderId: string
  productVariantId: string
  quantity: number
  unitCostSnapshot: string
  discountSnapshot: string
  taxSnapshot: string
  lineTotal: string
  productNameSnapshot: string
  skuSnapshot: string
}

type BackendPurchaseOrder = {
  id: string
  purchaseOrderNumber: string
  supplierId: string
  companyId: string
  branchId: string | null
  warehouseId: string | null
  paymentTermId: string | null
  transactionDate: string
  expectedDeliveryDate: string | null
  status: BackendPurchaseOrderStatus
  subtotal: string
  discountAmount: string
  taxAmount: string
  grandTotal: string
  currency: string
  notes: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
  itemCount?: number
  items?: BackendPurchaseOrderItem[]
}

type BackendAnalyticsGoodsReceiptItem = {
  purchaseOrderItemId: string
  receivedQuantity: number
  rejectedQuantity: number
}

type BackendAnalyticsGoodsReceipt = {
  id: string
  purchaseOrderId: string
  receiptDate: string
  items?: BackendAnalyticsGoodsReceiptItem[]
}

type BackendPaymentAllocation = {
  referenceType: string
  referenceId: string
  allocatedAmount: string
}

type BackendAnalyticsPayment = {
  id: string
  supplierId: string | null
  paymentDate: string
  allocations?: BackendPaymentAllocation[]
}

type BackendJoinSupplier = {
  id: string
  name: string
  displayName: string | null
  paymentTermId: string | null
}

type BackendPaymentTerm = {
  id: string
  name: string
}

function mapPoStatus(status: BackendPurchaseOrderStatus): PurchaseOrderStatus {
  const map: Record<BackendPurchaseOrderStatus, PurchaseOrderStatus> = {
    DRAFT: "draft",
    CONFIRMED: "approved",
    CANCELLED: "cancelled",
  }
  return map[status]
}

function mapItem(bi: BackendPurchaseOrderItem): PurchaseLineItem {
  return {
    id: bi.id,
    productId: bi.productVariantId,
    productName: bi.productNameSnapshot,
    sku: bi.skuSnapshot,
    quantity: bi.quantity,
    unitCost: parseFloat(bi.unitCostSnapshot) || 0,
    discount: parseFloat(bi.discountSnapshot) || 0,
    tax: parseFloat(bi.taxSnapshot) || 0,
    amount: parseFloat(bi.lineTotal) || 0,
  }
}

const PURCHASE_VALUE_STATUSES = new Set<PurchaseOrderStatus>(["approved", "partially_received", "received"])

function isFinancialPurchaseOrder(status: PurchaseOrderStatus) {
  return PURCHASE_VALUE_STATUSES.has(status)
}

function isSameMonth(dateInput: string, referenceDate: Date) {
  const date = new Date(dateInput)
  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth()
}

function getMonthKey(dateInput: string | Date) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function formatTrendLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(date)
}

function buildReceivedByPurchaseOrderItem(receipts: BackendAnalyticsGoodsReceipt[]) {
  const totals = new Map<string, number>()
  for (const receipt of receipts) {
    for (const item of receipt.items ?? []) {
      totals.set(item.purchaseOrderItemId, (totals.get(item.purchaseOrderItemId) ?? 0) + item.receivedQuantity)
    }
  }
  return totals
}

function buildPaidByPurchaseOrder(payments: BackendAnalyticsPayment[]) {
  const totals = new Map<string, number>()
  for (const payment of payments) {
    for (const allocation of payment.allocations ?? []) {
      if (allocation.referenceType !== "PURCHASE_ORDER") continue
      totals.set(
        allocation.referenceId,
        (totals.get(allocation.referenceId) ?? 0) + (parseFloat(allocation.allocatedAmount) || 0),
      )
    }
  }
  return totals
}

function resolveDisplayStatus(
  status: BackendPurchaseOrderStatus,
  items: BackendPurchaseOrderItem[] = [],
  receivedByPurchaseOrderItem: Map<string, number> = new Map(),
): PurchaseOrderStatus {
  const baseStatus = mapPoStatus(status)
  if (status !== "CONFIRMED") return baseStatus

  const orderedQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const receivedQuantity = items.reduce(
    (sum, item) => sum + (receivedByPurchaseOrderItem.get(item.id) ?? 0),
    0,
  )

  if (orderedQuantity === 0 || receivedQuantity <= 0) return baseStatus
  if (receivedQuantity >= orderedQuantity) return "received"
  return "partially_received"
}

async function fetchPurchaseAnalyticsReceipts(companyId: string): Promise<BackendAnalyticsGoodsReceipt[]> {
  try {
    const { data } = await apiClient.get<{ data: BackendAnalyticsGoodsReceipt[]; meta: unknown }>("/goods-receipts", {
      params: { companyId, limit: 100 },
    })
    return data.data ?? []
  } catch {
    return []
  }
}

async function fetchPurchaseAnalyticsPayments(companyId: string): Promise<BackendAnalyticsPayment[]> {
  try {
    const { data } = await apiClient.get<{ data: BackendAnalyticsPayment[]; meta: unknown }>("/payments", {
      params: { companyId, direction: "PAYMENT", limit: 100 },
    })
    return data.data ?? []
  } catch {
    return []
  }
}

async function fetchPaymentTermsById(companyId: string): Promise<Map<string, string>> {
  try {
    const { data } = await apiClient.get<{ data: BackendPaymentTerm[]; meta: unknown }>("/payment-terms", {
      params: { companyId, limit: 100 },
    })
    return new Map((data.data ?? []).map((term) => [term.id, term.name]))
  } catch {
    return new Map()
  }
}

function mapBackendToPurchaseOrder(
  bp: BackendPurchaseOrder,
  suppliers: Array<{ id: string; name: string; contactPerson: string; paymentTerms: string }> = [],
  receivedByPurchaseOrderItem: Map<string, number> = new Map()
): PurchaseOrder {
  const supplier = suppliers.find((entry) => entry.id === bp.supplierId)
  return {
    id: bp.id,
    poNumber: bp.purchaseOrderNumber,
    supplierId: bp.supplierId,
    supplierName: supplier?.name ?? "",
    // Not returned by this endpoint — no backend field for either.
    contact: supplier?.contactPerson ?? "",
    paymentTerms: supplier?.paymentTerms ?? "",
    date: bp.transactionDate,
    deliveryDate: bp.expectedDeliveryDate ?? "",
    status: resolveDisplayStatus(bp.status, bp.items ?? [], receivedByPurchaseOrderItem),
    itemCount: bp.itemCount ?? bp.items?.length ?? 0,
    items: (bp.items ?? []).map(mapItem),
    subtotal: parseFloat(bp.subtotal) || 0,
    taxTotal: parseFloat(bp.taxAmount) || 0,
    discountTotal: parseFloat(bp.discountAmount) || 0,
    grandTotal: parseFloat(bp.grandTotal) || 0,
    createdBy: bp.createdBy ?? "",
  }
}

async function fetchSuppliersForJoin(companyId: string): Promise<Array<{ id: string; name: string; contactPerson: string; paymentTerms: string }>> {
  try {
    const [supplierResponse, paymentTermsById] = await Promise.all([
      apiClient.get<{ data: BackendJoinSupplier[]; meta: unknown }>("/suppliers", {
        params: { companyId, limit: 100 },
      }),
      fetchPaymentTermsById(companyId),
    ])
    return (supplierResponse.data.data ?? []).map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.displayName ?? "",
      paymentTerms: supplier.paymentTermId ? paymentTermsById.get(supplier.paymentTermId) ?? "" : "",
    }))
  } catch {
    return []
  }
}

export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  if (USE_MOCK) return delay(mockPurchaseOrders)
  const companyId = await resolveCompanyId()
  const [poRes, suppliers, receipts] = await Promise.all([
    apiClient.get<{ data: BackendPurchaseOrder[]; meta: unknown }>("/purchase-orders", {
      params: { companyId, limit: 100 },
    }),
    fetchSuppliersForJoin(companyId),
    fetchPurchaseAnalyticsReceipts(companyId),
  ])
  const receivedByPurchaseOrderItem = buildReceivedByPurchaseOrderItem(receipts)
  return (poRes.data.data ?? []).map((bp) =>
    mapBackendToPurchaseOrder(bp, suppliers, receivedByPurchaseOrderItem),
  )
}

export async function fetchPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
  if (USE_MOCK) return delay(mockPurchaseOrders.find((o) => o.id === id))
  const companyId = await resolveCompanyId()
  try {
    const [poRes, suppliers, receipts] = await Promise.all([
      apiClient.get<BackendPurchaseOrder>(`/purchase-orders/${id}`, { params: { companyId } }),
      fetchSuppliersForJoin(companyId),
      fetchPurchaseAnalyticsReceipts(companyId),
    ])
    return mapBackendToPurchaseOrder(
      poRes.data,
      suppliers,
      buildReceivedByPurchaseOrderItem(receipts),
    )
  } catch {
    return undefined
  }
}

export async function createPurchaseOrder(values: PurchaseOrderFormValues): Promise<PurchaseOrder> {
  if (USE_MOCK) {
    const supplier = mockSuppliers.find((s) => s.id === values.supplierId)
    const items = values.items.map((item, index) => ({
      id: `poi-${Date.now()}-${index}`,
      ...item,
      amount: computeLineAmount(item.quantity, item.unitCost, item.discount, item.tax),
    }))
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)
    const discountTotal = items.reduce((sum, i) => sum + i.discount, 0)
    const taxTotal = items.reduce((sum, i) => sum + i.tax, 0)
    return delay({
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      supplierId: values.supplierId,
      supplierName: supplier?.name ?? "",
      contact: values.contact ?? supplier?.contactPerson ?? "",
      paymentTerms: values.paymentTerms ?? supplier?.paymentTerms ?? "",
      date: new Date().toISOString(),
      deliveryDate: values.deliveryDate,
      status: "draft",
      itemCount: items.length,
      items,
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal: subtotal - discountTotal + taxTotal,
      createdBy: "You",
    })
  }
  const companyId = await resolveCompanyId()
  const currency = await resolveCompanyCurrency(companyId)
  const { data } = await apiClient.post<BackendPurchaseOrder>("/purchase-orders", {
    companyId,
    supplierId: values.supplierId,
    paymentTermId: values.paymentTermId || undefined,
    expectedDeliveryDate: values.deliveryDate || undefined,
    currency,
    items: values.items.map((item) => ({
      // item.productId holds a real ProductVariant id — ProductSelector
      // lists variants (not products), since the backend requires
      // productVariantId, not productId.
      productVariantId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost.toFixed(2),
      discountAmount: item.discount ? item.discount.toFixed(2) : undefined,
      taxAmount: item.tax ? item.tax.toFixed(2) : undefined,
    })),
  })
  const suppliers = await fetchSuppliersForJoin(companyId)
  return mapBackendToPurchaseOrder(data, suppliers)
}

/** Real backend has no generic status PATCH — only POST :id/confirm and
 * POST :id/cancel (Phase 13's deliberately locked 3-state lifecycle). Any
 * status other than "approved" (-> confirm) or "cancelled" (-> cancel) has
 * no backend equivalent and is rejected rather than silently no-op'd. */
export async function updatePurchaseOrderStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> {
  if (USE_MOCK) {
    const existing = mockPurchaseOrders.find((o) => o.id === id)
    if (!existing) throw new Error("Purchase order not found")
    return delay({ ...existing, status })
  }
  const companyId = await resolveCompanyId()
  if (status === "approved") {
    const { data } = await apiClient.request<BackendPurchaseOrder>({
      url: `/purchase-orders/${id}/confirm`,
      method: "POST",
      params: { companyId },
    })
    const suppliers = await fetchSuppliersForJoin(companyId)
    return mapBackendToPurchaseOrder(data, suppliers)
  }
  if (status === "cancelled") {
    const { data } = await apiClient.request<BackendPurchaseOrder>({
      url: `/purchase-orders/${id}/cancel`,
      method: "POST",
      params: { companyId },
    })
    const suppliers = await fetchSuppliersForJoin(companyId)
    return mapBackendToPurchaseOrder(data, suppliers)
  }
  throw new Error(`Purchase order status "${status}" is not supported by the backend yet.`)
}

// --- Dashboard / Analytics ---
// No backend KPI/trend/product-cost analytics endpoints exist for purchase
// in Phase 00-31 — mock-only until real endpoints exist.

export async function fetchPurchaseKpis(): Promise<PurchaseKpis> {
  if (USE_MOCK) {
    const totalPurchaseValue = mockPurchaseOrders.reduce((sum, o) => sum + o.grandTotal, 0)
    const pendingOrders = mockPurchaseOrders.filter((o) =>
      ["pending_approval", "approved", "partially_received"].includes(o.status)
    ).length
    const receivedItems = mockPurchaseOrders
      .flatMap((o) => o.items)
      .reduce((sum, i) => sum + i.quantity, 0)
    const outstandingPayments = mockSuppliers.reduce((sum, s) => sum + s.outstanding, 0)
    return delay({ totalPurchaseValue, pendingOrders, receivedItems, outstandingPayments })
  }
  const companyId = await resolveCompanyId()
  const [purchaseOrders, receipts, payments] = await Promise.all([
    fetchPurchaseOrders(),
    fetchPurchaseAnalyticsReceipts(companyId),
    fetchPurchaseAnalyticsPayments(companyId),
  ])

  const now = new Date()
  const receivedByPurchaseOrderItem = buildReceivedByPurchaseOrderItem(receipts)
  const paidByPurchaseOrder = buildPaidByPurchaseOrder(payments)

  const totalPurchaseValue = purchaseOrders
    .filter((order) => isFinancialPurchaseOrder(order.status) && isSameMonth(order.date, now))
    .reduce((sum, order) => sum + order.grandTotal, 0)

  const pendingOrders = purchaseOrders.filter((order) => {
    if (!isFinancialPurchaseOrder(order.status)) return false
    const orderedQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const receivedQuantity = order.items.reduce(
      (sum, item) => sum + (receivedByPurchaseOrderItem.get(item.id) ?? 0),
      0,
    )
    return receivedQuantity < orderedQuantity
  }).length

  const receivedItems = receipts
    .filter((receipt) => isSameMonth(receipt.receiptDate, now))
    .reduce(
      (sum, receipt) =>
        sum + (receipt.items ?? []).reduce((itemSum, item) => itemSum + item.receivedQuantity, 0),
      0,
    )

  const outstandingPayments = purchaseOrders
    .filter((order) => isFinancialPurchaseOrder(order.status))
    .reduce((sum, order) => sum + Math.max(order.grandTotal - (paidByPurchaseOrder.get(order.id) ?? 0), 0), 0)

  return { totalPurchaseValue, pendingOrders, receivedItems, outstandingPayments }
}

export async function fetchPurchaseTrend(): Promise<PurchaseTrendPoint[]> {
  if (USE_MOCK) return delay(purchaseTrend)
  const purchaseOrders = await fetchPurchaseOrders()
  const now = new Date()
  const buckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return {
      key: getMonthKey(date),
      period: formatTrendLabel(date),
      amount: 0,
    }
  })
  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  for (const order of purchaseOrders) {
    if (!isFinancialPurchaseOrder(order.status)) continue
    const bucket = bucketMap.get(getMonthKey(order.date))
    if (!bucket) continue
    bucket.amount += order.grandTotal
  }

  return buckets.map(({ period, amount }) => ({ period, amount }))
}

export async function fetchProductCostAnalysis(): Promise<ProductCostPoint[]> {
  if (USE_MOCK) return delay(productCostAnalysis)
  const purchaseOrders = (await fetchPurchaseOrders())
    .filter((order) => isFinancialPurchaseOrder(order.status))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const historyByProduct = new Map<
    string,
    Array<{ productName: string; supplierName: string; unitCost: number }>
  >()

  for (const order of purchaseOrders) {
    for (const item of order.items) {
      const key = item.productId || item.sku || item.productName
      const history = historyByProduct.get(key) ?? []
      history.push({
        productName: item.productName,
        supplierName: order.supplierName,
        unitCost: item.unitCost,
      })
      historyByProduct.set(key, history)
    }
  }

  return Array.from(historyByProduct.values())
    .map((history) => {
      const [current, previous = history[0]] = history
      const previousCost = previous?.unitCost ?? current.unitCost
      const currentCost = current.unitCost
      const costChangePercent =
        previousCost > 0 ? ((currentCost - previousCost) / previousCost) * 100 : 0

      return {
        productName: current.productName,
        previousCost,
        currentCost,
        costChangePercent,
        supplierName: current.supplierName,
      }
    })
    .sort((a, b) => Math.abs(b.costChangePercent) - Math.abs(a.costChangePercent))
    .slice(0, 10)
}
