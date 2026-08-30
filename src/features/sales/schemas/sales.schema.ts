import { z } from "zod"

export const salesOrderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string(),
  sku: z.string(),
  uomId: z.string().optional(),
  uomLabel: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  quantity: z.number().positive("Quantity must be greater than zero"),
  price: z.number().min(0),
  discount: z.number().min(0),
  tax: z.number().min(0),
})

export const salesOrderFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  priceListId: z.string().optional(),
  items: z.array(salesOrderItemSchema).min(1, "At least one product is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  notes: z.string().max(1000).optional(),
})

export type SalesOrderFormValues = z.infer<typeof salesOrderFormSchema>
export type SalesOrderItemValues = z.infer<typeof salesOrderItemSchema>

export const checkoutFormSchema = z.object({
  customerId: z.string().optional(),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "mobile_payment", "credit"]),
  amountTendered: z.number().min(0, "Amount must be zero or greater"),
})

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

const salesReturnItemConditionSchema = z.enum(["RESTOCK", "DAMAGED"])

export const salesReturnItemSchema = z
  .object({
    saleItemId: z.string().min(1),
    productId: z.string().min(1, "Product is required"),
    productName: z.string(),
    sku: z.string(),
    color: z.string().optional(),
    size: z.string().optional(),
    purchasedQty: z.number(),
    maxReturnableQty: z.number().min(0),
    returnQty: z.number().min(0, "Return quantity cannot be negative"),
    unitPrice: z.number().min(0),
    condition: salesReturnItemConditionSchema,
  })
  .refine((data) => data.returnQty <= data.maxReturnableQty, {
    message: "Return quantity cannot exceed remaining returnable quantity",
    path: ["returnQty"],
  })

// invoiceId here is the real Sale id (CreateSaleReturnDto.saleId) — there
// is no separate refundMethod/type on the backend (see SalesReturn type
// comment), only a free-text reason and the line items being returned.
export const salesReturnFormSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().max(1000, "Notes must be 1000 characters or fewer").optional(),
  items: z.array(salesReturnItemSchema).min(1, "Add at least one product to return"),
}).refine((data) => data.items.some((item) => item.returnQty > 0), {
  message: "Choose at least one item with a return quantity greater than zero",
  path: ["items"],
})

export type SalesReturnFormValues = z.infer<typeof salesReturnFormSchema>
