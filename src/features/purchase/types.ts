/** Core domain types for the Purchase & Supplier Management module. */

export type SupplierType = "manufacturer" | "wholesaler" | "distributor" | "agent"
export type SupplierStatus = "active" | "inactive" | "blocked"

export type PaymentTermOption = {
  id: string
  name: string
  dueDays: number
}

export type Supplier = {
  id: string
  name: string
  code: string
  paymentTermId?: string | null
  type: SupplierType
  status: SupplierStatus
  contactPerson: string
  phone: string
  email: string
  website?: string
  address?: string
  country?: string
  taxId?: string
  creditDays?: number
  openingBalance?: number
  notes?: string
  paymentTerms: string
  currency?: string
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
  uomId?: string
  uomLabel?: string
  color?: string
  size?: string
  quantity: number
  remainingQty?: number
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

export type RequestForQuotationStatus = "draft" | "sent" | "closed" | "cancelled"

export type RequestForQuotationItem = {
  id: string
  purchaseRfqId: string
  productId: string
  productName: string
  sku: string
  quantity: number
  reason: string
}

export type RequestForQuotation = {
  id: string
  rfqNumber: string
  purchaseRequestId?: string | null
  title: string
  requiredDate: string
  status: RequestForQuotationStatus
  invitedSupplierIds: string[]
  items: RequestForQuotationItem[]
  notes?: string
  createdAt: string
}

export type SupplierQuotationStatus = "submitted" | "awarded" | "rejected"

export type SupplierQuotationItem = {
  id: string
  supplierQuotationId: string
  purchaseRfqItemId: string
  productId: string
  productName: string
  sku: string
  quantity: number
  unitCost: number
  discount: number
  tax: number
  amount: number
}

export type SupplierQuotation = {
  id: string
  quotationNumber: string
  purchaseRfqId: string
  supplierId: string
  paymentTermId?: string | null
  leadTimeDays?: number | null
  status: SupplierQuotationStatus
  subtotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  currency: string
  rfq?: {
    id: string
    rfqNumber: string
    title: string
    requiredDate: string
    purchaseRequestId?: string | null
  }
  items: SupplierQuotationItem[]
  notes?: string
  createdAt: string
}

export type PurchaseOrderStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "partially_received"
  | "received"
  | "rejected"
  | "closed"
  | "cancelled"

export type PurchaseOrder = {
  id: string
  poNumber: string
  supplierId: string
  sourceSupplierQuotationId?: string | null
  supplierName: string
  contact: string
  paymentTerms: string
  date: string
  deliveryDate: string
  branchId?: string | null
  warehouseId?: string | null
  status: PurchaseOrderStatus
  itemCount: number
  items: PurchaseLineItem[]
  subtotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number
  createdBy: string
}

export type ReceiptLineItem = {
  id: string
  purchaseOrderItemId?: string
  productId: string
  productName: string
  sku: string
  color?: string
  size?: string
  orderedQty: number
  receivedQty: number
  rejectedQty: number
}

export type GoodsReceiptStatus = "confirmed"

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
  createdAt?: string
}

export type PaymentStatus = "paid" | "partial" | "unpaid" | "overdue"

export type PurchaseInvoice = {
  id: string
  invoiceNumber: string
  supplierId: string
  supplierName: string
  purchaseOrderId: string
  poNumber: string
  subtotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number
  amountPaid: number
  creditedAmount: number
  balanceAmount: number
  status: "draft" | "posted" | "voided"
  paymentStatus: PaymentStatus
  dueDate: string
  issuedAt: string
  goodsReceiptIds: string[]
  currency?: string
}

export type PaymentMethod = "cash" | "bank_transfer" | "credit" | "mobile_payment"

/** A real backend PaymentMethod (GET /payment-methods) — company-configured, not a fixed enum. */
export type PaymentMethodOption = {
  id: string
  name: string
}

export type SupplierPayment = {
  id: string
  reference: string
  supplierId: string
  supplierName: string
  purchaseInvoiceId: string
  invoiceNumber: string
  purchaseOrderId: string
  poNumber: string
  paymentMethodId: string
  paymentMethodName: string
  paymentDate: string
  amount: number
  referenceNumber?: string
  notes?: string
}

export type ReturnReason = "damaged_product" | "wrong_item" | "quality_issue" | "supplier_return"
export type ReturnStatus = "draft" | "completed" | "cancelled"

export type PurchaseReturnItem = {
  id: string
  purchaseOrderItemId: string
  productId: string
  productName: string
  sku: string
  color?: string
  size?: string
  quantity: number
  unitCost: number
  lineTotal?: number
}

export type PurchaseReturn = {
  id: string
  reference: string
  supplierId: string
  supplierName: string
  purchaseOrderId: string
  poNumber: string
  purchaseInvoiceId: string
  invoiceNumber: string
  reason: ReturnReason
  status: ReturnStatus
  items: PurchaseReturnItem[]
  creditAppliedAmount: number
  supplierCreditAmount: number
  notes?: string
  createdAt: string
  completedAt?: string
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
