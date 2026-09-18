import type { SalesOrder } from "@/features/sales/types"

export type OnlineOrderSource = "TELEGRAM" | "WEBSITE" | "FACEBOOK"

export type OnlineOrderStatus =
  | "PENDING_REVIEW"
  | "CONFIRMED"
  | "PACKED"
  | "ON_MY_WAY"
  | "DELIVERED"
  | "CANCELLED"

export type OnlineOrderItem = {
  id: string
  productId?: string
  productVariantId?: string
  productName?: string
  productNameSnapshot?: string
  sku?: string
  skuSnapshot?: string
  color?: string
  size?: string
  quantity: number
  price?: number | string
  unitPriceSnapshot?: number | string
  discount?: number | string
  discountSnapshot?: number | string
  tax?: number | string
  taxSnapshot?: number | string
  total?: number | string
  lineTotal?: number | string
}

export type OnlineOrderSale = Partial<SalesOrder> & {
  saleNumber?: string
  orderNumber?: string
  subtotal?: number | string
  discountAmount?: number | string
  discountTotal?: number | string
  taxAmount?: number | string
  taxTotal?: number | string
  grandTotal?: number | string
  items?: OnlineOrderItem[]
}

export type CodStatus = "NONE" | "PENDING" | "SETTLED" | "FAILED"

export type OnlineOrder = {
  id: string
  companyId: string
  saleId: string
  customerId: string
  source: OnlineOrderSource
  status: OnlineOrderStatus
  telegramUserId: string | null
  telegramUsername: string | null
  deliveryAddress: string
  courierService?: string | null
  trackingNumber?: string | null
  codAmount?: string
  codStatus?: CodStatus
  riderName?: string | null
  riderPhone?: string | null
  settledAt?: string | null
  statusUpdatedAt: string | null
  createdAt: string
  updatedAt: string

  // Joined properties for UI convenience (these would typically come from a DTO)
  sale?: OnlineOrderSale
  customerName?: string | null
  customerPhone?: string | null
}
