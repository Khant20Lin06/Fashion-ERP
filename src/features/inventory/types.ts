/** Core domain types for the Inventory & Warehouse Management module. */

// Only "available"/"out_of_stock" are derivable from availableQty alone.
// "low_stock"/"over_stock" would need a reorder-level/overstock-level
// field that doesn't exist anywhere in the backend schema; "reserved" was
// never actually assigned by any code path.
export type StockStatus = "available" | "out_of_stock"

export type WarehouseStatus = "active" | "inactive"
export type WarehouseType = "MAIN" | "STORE" | "DISTRIBUTION" | "TRANSIT" | "RETURN" | "VIRTUAL" | "OTHER"

export type Warehouse = {
  id: string
  name: string
  code: string
  type: WarehouseType
  branchId: string
  branchName: string
  address: string
  manager?: string
  contact?: string
  status: WarehouseStatus
  totalProducts: number | null
  stockValue: number | null
}

export type Branch = {
  id: string
  name: string
  warehouseIds: string[]
}

/**
 * A single product-variant's stock position within one warehouse. Stock
 * fields come from the real GET /reports/inventory/stock-summary report
 * (erp-pos fashion api InventoryReportsService); productName/color/size
 * are resolved via a separate real /products + /products/:id/variants
 * join (see fetchInventory in api/inventory.api.ts) since the stock report
 * itself doesn't carry them. There is no image, cost, incoming-qty, or
 * reorder-level field anywhere in the backend schema — those are not
 * represented here (a previous version invented them).
 */
export type InventoryItem = {
  id: string
  productVariantId: string
  productName: string
  sku: string
  color?: string
  size?: string
  warehouseId: string
  warehouseName: string
  availableQty: number
  reservedQty: number
}

export type MovementType =
  | "purchase_receipt"
  | "sales_delivery"
  | "stock_transfer"
  | "stock_adjustment"
  | "return"
  | "damage"
  | "opening_stock"

export type StockMovement = {
  id: string
  date: string
  type: MovementType
  reference: string
  productId: string
  productName: string
  sku: string
  variantLabel?: string
  warehouseId: string
  warehouseName: string
  qtyBefore: number
  qtyChange: number
  qtyAfter: number
  user: string
}

export type TransferLineItem = {
  id: string
  productId: string
  productName: string
  sku: string
  variantLabel?: string
  availableQty?: number
  transferQty: number
}

/** StockTransfer is create-only/atomic on the real backend (Phase 14 D9/D22,
 * LOCKED) — no status field, no approval workflow, no PATCH exists. */
export type StockTransfer = {
  id: string
  reference: string
  fromWarehouseId: string
  fromWarehouseName: string
  toWarehouseId: string
  toWarehouseName: string
  items: TransferLineItem[]
  notes?: string
  createdBy: string
  createdAt: string
}

export type AdjustmentType =
  | "stock_count_difference"
  | "damaged_product"
  | "lost_item"
  | "expired_item"
  | "found_item"
  | "opening_balance"
  | "manual_correction"

export type AdjustmentStatus = "pending" | "approved" | "rejected"

export type StockAdjustment = {
  id: string
  reference: string
  warehouseId: string
  warehouseName: string
  productId: string
  productName: string
  sku: string
  variantLabel?: string
  currentQty: number
  adjustedQty: number
  difference: number
  type: AdjustmentType
  reason: string
  notes?: string
  status: AdjustmentStatus
  createdBy: string
  createdAt: string
}

export type StockCountStatus = "pending" | "reviewed" | "approved"

export type StockCountLine = {
  id: string
  productId: string
  productName: string
  sku: string
  variantLabel?: string
  systemQty: number
  countedQty: number | null
  difference: number
  status: StockCountStatus
}

export type StockCountSession = {
  id: string
  reference: string
  warehouseId: string
  warehouseName: string
  createdAt: string
  status: "in_progress" | "completed"
  lines: StockCountLine[]
}

// totalInventoryValue and lowStockItems were removed: valuation needs a
// per-variant costPrice join the stock-summary report doesn't provide, and
// "low stock" needs a reorder-level field that doesn't exist anywhere in
// the backend schema (see AGENTS/Phase 21 audit) — both would have to be
// fabricated to populate.
export type InventoryKpis = {
  totalProducts: number
  outOfStockItems: number
}

export type StockValuePoint = {
  warehouse: string
  value: number
}

export type CategoryStockPoint = {
  category: string
  quantity: number
}

export type MovementTrendPoint = {
  period: string
  incoming: number
  outgoing: number
}

export type InventoryFilters = {
  warehouse?: string
  status?: string
  category?: string
}
