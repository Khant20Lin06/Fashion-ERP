/** Core domain types for the Inventory & Warehouse Management module. */

export type StockStatus = "available" | "low_stock" | "out_of_stock" | "over_stock" | "reserved"

export type WarehouseStatus = "active" | "inactive"

export type Warehouse = {
  id: string
  name: string
  code: string
  branchId: string
  branchName: string
  address: string
  manager: string
  contact: string
  status: WarehouseStatus
  totalProducts: number
  stockValue: number
}

export type Branch = {
  id: string
  name: string
  warehouseIds: string[]
}

/** A single product-variant's stock position within one warehouse. */
export type InventoryItem = {
  id: string
  productId: string
  productName: string
  imageUrl?: string
  sku: string
  variantId?: string
  color?: string
  size?: string
  warehouseId: string
  warehouseName: string
  availableQty: number
  reservedQty: number
  incomingQty: number
  reorderLevel: number
  overstockLevel: number
  unitCost: number
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

export type TransferStatus = "draft" | "pending_approval" | "approved" | "completed" | "cancelled"

export type TransferLineItem = {
  id: string
  productId: string
  productName: string
  sku: string
  variantLabel?: string
  availableQty: number
  transferQty: number
}

export type StockTransfer = {
  id: string
  reference: string
  fromWarehouseId: string
  fromWarehouseName: string
  toWarehouseId: string
  toWarehouseName: string
  status: TransferStatus
  items: TransferLineItem[]
  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
}

export type AdjustmentType =
  | "stock_count_difference"
  | "damaged_product"
  | "lost_item"
  | "expired_item"
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

export type InventoryKpis = {
  totalInventoryValue: number
  totalProducts: number
  lowStockItems: number
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
