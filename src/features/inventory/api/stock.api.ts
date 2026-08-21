import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { AdjustmentType, MovementType, StockAdjustment, StockCountSession, StockMovement } from "../types"
import type { AdjustmentFormValues } from "../schemas/adjustment.schema"
import { mockAdjustments, mockMovements, mockStockCounts } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// There is no unifying /inventory/* prefix on the backend — movements live
// under @Controller('inventory-ledger') and adjustments under
// @Controller('stock-adjustments'). Stock counts and SKU lookup have no
// backend endpoint at all in Phase 00-31.

// --- Stock movements (read-only ledger) ---

type BackendMovementType =
  | "PURCHASE_RECEIPT"
  | "SALE_ISSUE"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "ADJUSTMENT"
  | "OPENING_BALANCE"

type BackendLedgerEntry = {
  id: string
  warehouseId: string
  warehouseName: string | null
  productVariantId: string
  productName: string | null
  sku: string | null
  variantLabel: string | null
  movementType: BackendMovementType
  quantityChange: number
  quantityAfter: number
  referenceType: string
  referenceId: string
  referenceNumber: string | null
  createdAt: string
  createdBy: string | null
  createdByName: string | null
}

function mapMovementType(type: BackendMovementType): MovementType {
  const map: Record<BackendMovementType, MovementType> = {
    PURCHASE_RECEIPT: "purchase_receipt",
    SALE_ISSUE: "sales_delivery",
    TRANSFER_IN: "stock_transfer",
    TRANSFER_OUT: "stock_transfer",
    ADJUSTMENT: "stock_adjustment",
    OPENING_BALANCE: "stock_adjustment",
  }
  return map[type]
}

function mapLedgerToMovement(be: BackendLedgerEntry): StockMovement {
  return {
    id: be.id,
    date: be.createdAt,
    type: mapMovementType(be.movementType),
    reference: be.referenceNumber ?? be.referenceId,
    productId: be.productVariantId,
    // Not returned by this endpoint — would require a products join.
    productName: be.productName ?? "",
    sku: be.sku ?? "",
    variantLabel: be.variantLabel ?? undefined,
    warehouseId: be.warehouseId,
    warehouseName: be.warehouseName ?? "",
    qtyBefore: be.quantityAfter - be.quantityChange,
    qtyChange: be.quantityChange,
    qtyAfter: be.quantityAfter,
    user: be.createdByName ?? be.createdBy ?? "",
  }
}

export async function fetchStockMovements(): Promise<StockMovement[]> {
  if (USE_MOCK) return delay(mockMovements)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendLedgerEntry[]; meta: unknown }>(
    "/inventory-ledger",
    { params: { companyId, limit: 100 } },
  )
  return (data.data ?? []).map(mapLedgerToMovement)
}

// --- Stock adjustments ---

type BackendAdjustmentReason = "OPENING_BALANCE" | "DAMAGE" | "LOSS" | "FOUND" | "CORRECTION"

type BackendStockAdjustment = {
  id: string
  adjustmentNumber: string
  warehouseId: string
  warehouseName: string | null
  productVariantId: string
  productName: string | null
  sku: string | null
  variantLabel: string | null
  quantityChange: number
  quantityAfter: number | null
  reason: BackendAdjustmentReason
  companyId: string
  notes: string | null
  createdBy: string
  createdByName: string | null
  createdAt: string
  updatedAt: string
}

const FORM_TYPE_TO_BACKEND_REASON: Record<AdjustmentType, BackendAdjustmentReason> = {
  stock_count_difference: "CORRECTION",
  damaged_product: "DAMAGE",
  lost_item: "LOSS",
  expired_item: "DAMAGE",
  found_item: "FOUND",
  opening_balance: "OPENING_BALANCE",
  manual_correction: "CORRECTION",
}

const BACKEND_REASON_TO_TYPE: Record<BackendAdjustmentReason, AdjustmentType> = {
  OPENING_BALANCE: "opening_balance",
  DAMAGE: "damaged_product",
  LOSS: "lost_item",
  FOUND: "found_item",
  CORRECTION: "manual_correction",
}

const BACKEND_REASON_LABEL: Record<BackendAdjustmentReason, string> = {
  OPENING_BALANCE: "Opening Balance",
  DAMAGE: "Damaged Product",
  LOSS: "Lost Item",
  FOUND: "Found Item",
  CORRECTION: "Manual Correction",
}

function mapBackendToAdjustment(ba: BackendStockAdjustment): StockAdjustment {
  const adjustedQty = ba.quantityAfter ?? Math.max(0, ba.quantityChange)
  const currentQty = ba.quantityAfter != null ? ba.quantityAfter - ba.quantityChange : 0
  return {
    id: ba.id,
    reference: ba.adjustmentNumber,
    warehouseId: ba.warehouseId,
    warehouseName: ba.warehouseName ?? "",
    productId: ba.productVariantId,
    productName: ba.productName ?? "",
    sku: ba.sku ?? "",
    variantLabel: ba.variantLabel ?? undefined,
    currentQty,
    adjustedQty,
    difference: ba.quantityChange,
    type: BACKEND_REASON_TO_TYPE[ba.reason],
    reason: ba.notes?.trim() || BACKEND_REASON_LABEL[ba.reason],
    notes: ba.notes ?? undefined,
    status: "approved",
    createdBy: ba.createdByName ?? ba.createdBy,
    createdAt: ba.createdAt,
  }
}

export async function fetchStockAdjustments(): Promise<StockAdjustment[]> {
  if (USE_MOCK) return delay(mockAdjustments)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendStockAdjustment[]; meta: unknown }>(
    "/stock-adjustments",
    { params: { companyId, limit: 100 } },
  )
  return (data.data ?? []).map(mapBackendToAdjustment)
}

export async function createStockAdjustment(values: AdjustmentFormValues): Promise<StockAdjustment> {
  if (USE_MOCK) {
    return delay({
      id: `adj-${Date.now()}`,
      reference: `ADJ-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      warehouseId: values.warehouseId,
      warehouseName: "",
      productId: values.productId,
      productName: "",
      sku: "",
      currentQty: values.currentQty,
      adjustedQty: values.adjustedQty,
      difference: values.adjustedQty - values.currentQty,
      type: values.type,
      reason: values.reason,
      notes: values.notes,
      status: "approved",
      createdBy: "You",
      createdAt: new Date().toISOString(),
    })
  }
  const companyId = await resolveCompanyId()
  const quantityChange = values.adjustedQty - values.currentQty
  // The backend has no freeform-reason column (`reason` on
  // CreateStockAdjustmentDto is the enum itself) — the form's separate
  // required "Reason" text has no field of its own to travel in, so it's
  // folded into `notes` rather than being silently discarded.
  const notes = [values.reason, values.notes].filter(Boolean).join(" - ") || undefined
  const { data } = await apiClient.post<BackendStockAdjustment>("/stock-adjustments", {
    companyId,
    warehouseId: values.warehouseId,
    productVariantId: values.productId,
    quantityChange,
    reason: FORM_TYPE_TO_BACKEND_REASON[values.type],
    notes,
  })
  return mapBackendToAdjustment(data)
}

// --- Stock counts ---
// No backend stock-count-session endpoint exists — mock-only.

export async function fetchStockCounts(): Promise<StockCountSession[]> {
  if (USE_MOCK) return delay(mockStockCounts)
  return []
}

export async function submitStockCount(sessionId: string, lines: StockCountSession["lines"]): Promise<StockCountSession> {
  if (USE_MOCK) {
    const session = mockStockCounts.find((s) => s.id === sessionId)
    if (!session) throw new Error("Stock count session not found")
    return delay({ ...session, lines, status: "completed" })
  }
  throw new Error("Stock counts are not available yet.")
}

// --- SKU lookup ---
// No backend lookup-by-SKU endpoint exists in inventory — products.api.ts
// covers products/variants by id; mock-only until a real endpoint exists.

export async function lookupBySku(sku: string) {
  if (USE_MOCK) {
    const { mockInventory } = await import("./mock-data")
    return delay(mockInventory.find((i) => i.sku.toLowerCase() === sku.toLowerCase()))
  }
  return undefined
}
