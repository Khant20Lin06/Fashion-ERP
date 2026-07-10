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
  items: SalesLineItem[]
  subtotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  amountPaid: number
  paymentMethod: PaymentMethod
  paymentStatus: InvoicePaymentStatus
  status: "open" | "closed" | "voided"
}

export type ReturnType = "product_return" | "exchange" | "refund" | "store_credit"
export type ReturnStatus = "requested" | "approved" | "processed" | "rejected"

export type SalesReturnItem = {
  id: string
  productId: string
  productName: string
  sku: string
  color?: string
  size?: string
  purchasedQty: number
  returnQty: number
  unitPrice: number
}

export type SalesReturn = {
  id: string
  reference: string
  invoiceId: string
  invoiceNumber: string
  customerId: string
  customerName: string
  type: ReturnType
  reason: string
  refundMethod: PaymentMethod | "store_credit"
  status: ReturnStatus
  items: SalesReturnItem[]
  refundAmount: number
  createdAt: string
}

export type DiscountKind = "product" | "category" | "customer" | "campaign"

export type DiscountRule = {
  id: string
  name: string
  kind: DiscountKind
  target: string
  percent: number
  isActive: boolean
  startDate?: string
  endDate?: string
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
  profitMargin: number
}

export type CustomerAnalyticsSummary = {
  newCustomers: number
  returningCustomers: number
  customerLifetimeValue: number
}

/** Cart line item — the working-state shape used by the POS cart before checkout. */
export type CartItem = {
  id: string
  productId: string
  productName: string
  sku: string
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
