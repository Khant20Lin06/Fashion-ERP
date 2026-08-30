/** Core domain types for the Sales & Customer Management module. */

export type Gender = "male" | "female" | "other"
export type CustomerStatus = "active" | "inactive"
export type MemberLevel = "bronze" | "silver" | "gold" | "platinum"

export type Customer = {
  id: string
  name: string
  gender?: Gender
  birthday?: string
  phone: string
  email: string
  country: string
  city: string
  address: string
  customerGroup: string
  loyaltyMember: boolean
  memberLevel: MemberLevel
  preferredSize?: string
  preferredBrand?: string
  totalOrders: number
  totalSpending: number
  loyaltyPoints: number
  status: CustomerStatus
  createdAt: string
}

export type CustomerAnalytics = {
  totalPurchase: number
  averageOrderValue: number
  lastPurchaseDate: string
  favoriteCategories: string[]
  favoriteBrands: string[]
}

/** A single line item shared across Cart / Sales Order / Invoice / Return. */
export type SalesLineItem = {
  id: string
  productId: string
  productName: string
  sku: string
  uomId?: string
  uomLabel?: string
  imageUrl?: string
  color?: string
  size?: string
  quantity: number
  price: number
  discount: number
  tax: number
  total: number
}

export type SalesOrderStatus = "draft" | "confirmed" | "processing" | "delivered" | "completed" | "cancelled"

export type SalesOrder = {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  priceListId?: string
  items: SalesLineItem[]
  deliveryDate: string
  paymentTerms: string
  notes?: string
  status: SalesOrderStatus
  subtotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  createdAt: string
}

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "mobile_payment" | "credit"
export type InvoicePaymentStatus = "paid" | "partial" | "unpaid" | "refunded"

export type SalesInvoice = {
  id: string
  invoiceNumber: string
  date: string
  customerId: string
  customerName: string
  salesPerson: string
  warehouseId?: string | null
  items: SalesLineItem[]
  subtotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  amountPaid: number
  paymentMethod: PaymentMethod
  paymentStatus: InvoicePaymentStatus
  status: "DRAFT" | "CONFIRMED" | "CANCELLED"
  /** True only when checkout's sale was confirmed but its Payment record
   * could not be created (e.g. no PaymentMethod configured with a GL
   * account) — the sale is real, its paidAmount just wasn't updated. */
  paymentRecordingFailed?: boolean
}

// Real backend SaleReturnStatus (erp-pos fashion api
// src/modules/sales-returns) is DRAFT | CONFIRMED | CANCELLED — there is
// no approve/reject/process workflow, and no refundMethod/exchange/
// store_credit concept on the backend at all (see comment on SalesReturn
// below).
export type ReturnStatus = "draft" | "confirmed" | "refunded" | "cancelled"
export type SalesReturnItemCondition = "RESTOCK" | "DAMAGED"

export type SalesReturnItem = {
  id: string
  saleItemId: string
  productId: string
  productName: string
  sku: string
  color?: string
  size?: string
  purchasedQty: number
  returnQty: number
  unitPrice: number
  discountAmount?: number
  lineTotal?: number
  condition?: SalesReturnItemCondition
}

// Mirrors the real backend row (SaleReturnResponseDto). There is no
// ReturnType (product_return/exchange/refund/store_credit) or
// refundMethod field on the backend — a return is just line items against
// a sale with a reason, confirmed or cancelled; those UI concepts were
// invented and are not sent/stored anywhere real.
export type SalesReturn = {
  id: string
  returnNumber: string
  saleId: string
  invoiceNumber: string
  saleWarehouseId?: string | null
  customerId: string
  customerName: string
  reason: string
  status: ReturnStatus
  items: SalesReturnItem[]
  refundAmount: number
  refundedAmount: number
  notes?: string
  createdAt: string
}

export type LoyaltyTransaction = {
  id: string
  customerId: string
  type: "earn" | "redeem"
  points: number
  reference: string
  date: string
}

export type SalesKpis = {
  todaysSales: number
  todaysSalesChangePercent: number
  monthlyRevenue: number
  orders: number
  customers: number
}

export type RevenueTrendGranularity = "daily" | "weekly" | "monthly" | "yearly"

export type RevenueTrendPoint = {
  period: string
  revenue: number
}

export type ProductPerformancePoint = {
  productName: string
  unitsSold: number
  revenue: number
}

export type ProductPerformanceSummary = {
  topSelling: ProductPerformancePoint[]
  slowMoving: ProductPerformancePoint[]
}

export type CustomerAnalyticsSummary = {
  newCustomers: number
  returningCustomers: number
  averageCustomerSpend: number
}

export type SalesReportFilters = {
  branchId?: string
  fromDate?: string
  toDate?: string
}

/** Cart line item — the working-state shape used by the POS cart before checkout. */
export type CartItem = {
  id: string
  productVariantId?: string
  productId: string
  productName: string
  sku: string
  uomId?: string
  uomLabel?: string
  imageUrl?: string
  color?: string
  size?: string
  price: number
  quantity: number
  discountPercent: number
  availableStock: number
}

export type SalesFilters = {
  customer?: string
  status?: string
  paymentStatus?: string
}

export type SalesPriceListOption = {
  id: string
  code: string
  name: string
  currency: string
}

export type SalesItemPricingPreview = {
  productVariantId: string
  priceListId: string
  uomId?: string
  uomCode?: string
  uomName?: string
  quantity: number
  baseQuantity: number
  conversionFactorToBase: string
  unitPrice: number
  transactionDate: string
}
