/** Core domain types for the Purchase & Supplier Management module. */

export type SupplierType = "manufacturer" | "wholesaler" | "distributor" | "agent"
export type SupplierStatus = "active" | "inactive"

export type Supplier = {
  id: string
  name: string
  code: string
  type: SupplierType
  status: SupplierStatus
  contactPerson: string
  phone: string
  email: string
  website?: string
  address: string
  country: string
  taxId?: string
  paymentTerms: string
  currency: string
  bankAccount?: string
  totalPurchase: number
  outstanding: number
}

export type SupplierPerformance = {
  avgDeliveryDays: number
  orderAccuracy: number
  qualityRating: number
  purchaseVolume: number
}

/** A single line item shared across Purchase Request / Purchase Order / Goods Receipt. */
export type PurchaseLineItem = {
  id: string
  productId: string
  productName: string
  sku: string
  color?: string
  size?: string
  quantity: number
  unitCost: number
  discount: number
  tax: number
  amount: number
}

export type RequestStatus = "draft" | "submitted" | "approved" | "converted" | "rejected"

export type PurchaseRequestItem = {
  id: string
  productId: string
  productName: string
  sku: string
  color?: string
  size?: string
  quantity: number
  reason: string
}

export type PurchaseRequest = {
  id: string
  reference: string
  department: string
  requester: string
  requiredDate: string
  status: RequestStatus
  items: PurchaseRequestItem[]
  notes?: string
  createdAt: string
}

export type PurchaseOrderStatus = "draft" | "pending_approval" | "approved" | "partially_received" | "received" | "cancelled"

export type PurchaseOrder = {
  id: string
  poNumber: string
  supplierId: string
  supplierName: string
  contact: string
  paymentTerms: string
  date: string
  deliveryDate: string
  status: PurchaseOrderStatus
  items: PurchaseLineItem[]
  subtotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number
  createdBy: string
}

export type ReceiptLineItem = {
  id: string
  productId: string
  productName: string
  sku: string
  color?: string
  size?: string
  orderedQty: number
  receivedQty: number
  rejectedQty: number
}

export type GoodsReceiptStatus = "draft" | "confirmed"

export type GoodsReceipt = {
  id: string
  reference: string
  purchaseOrderId: string
  poNumber: string
  supplierId: string
  supplierName: string
  warehouseId: string
  warehouseName: string
  status: GoodsReceiptStatus
  items: ReceiptLineItem[]
  receivedBy: string
  receivedAt: string
}

export type PaymentStatus = "paid" | "partial" | "unpaid" | "overdue"

export type PurchaseInvoice = {
  id: string
  invoiceNumber: string
  supplierId: string
  supplierName: string
  purchaseOrderId: string
  poNumber: string
  items: PurchaseLineItem[]
  subtotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number
  amountPaid: number
  paymentStatus: PaymentStatus
  dueDate: string
  issuedAt: string
}

export type PaymentMethod = "cash" | "bank_transfer" | "credit" | "mobile_payment"

export type SupplierPayment = {
  id: string
  reference: string
  supplierId: string
  supplierName: string
  invoiceId: string
  invoiceNumber: string
  paymentDate: string
  amount: number
  method: PaymentMethod
  referenceNumber?: string
  notes?: string
}

export type ReturnReason = "damaged_product" | "wrong_item" | "quality_issue" | "supplier_return"
export type ReturnStatus = "draft" | "submitted" | "approved" | "completed"

export type PurchaseReturnItem = {
  id: string
  productId: string
  productName: string
  sku: string
  color?: string
  size?: string
  quantity: number
  unitCost: number
}

export type PurchaseReturn = {
  id: string
  reference: string
  supplierId: string
  supplierName: string
  purchaseOrderId?: string
  poNumber?: string
  reason: ReturnReason
  status: ReturnStatus
  items: PurchaseReturnItem[]
  notes?: string
  createdAt: string
}

export type PurchaseKpis = {
  totalPurchaseValue: number
  pendingOrders: number
  receivedItems: number
  outstandingPayments: number
}

export type PurchaseTrendPoint = {
  period: string
  amount: number
}

export type ProductCostPoint = {
  productName: string
  previousCost: number
  currentCost: number
  costChangePercent: number
  supplierName: string
}

export type PurchaseFilters = {
  supplier?: string
  status?: string
}
