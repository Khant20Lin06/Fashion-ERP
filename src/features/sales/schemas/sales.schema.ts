import { z } from "zod"

export const salesOrderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string(),
  sku: z.string(),
  color: z.string().optional(),
  size: z.string().optional(),
  quantity: z.number().positive("Quantity must be greater than zero"),
  price: z.number().min(0),
  discount: z.number().min(0),
  tax: z.number().min(0),
})

export const salesOrderFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
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

export const salesReturnItemSchema = z
  .object({
    productId: z.string().min(1, "Product is required"),
    productName: z.string(),
    sku: z.string(),
    color: z.string().optional(),
    size: z.string().optional(),
    purchasedQty: z.number(),
    returnQty: z.number().positive("Return quantity must be greater than zero"),
    unitPrice: z.number().min(0),
  })
  .refine((data) => data.returnQty <= data.purchasedQty, {
    message: "Return quantity cannot exceed purchase quantity",
    path: ["returnQty"],
  })

export const salesReturnFormSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  type: z.enum(["product_return", "exchange", "refund", "store_credit"]),
  reason: z.string().min(1, "Reason is required"),
  refundMethod: z.enum(["cash", "card", "bank_transfer", "mobile_payment", "credit", "store_credit"]),
  items: z.array(salesReturnItemSchema).min(1, "Add at least one product to return"),
})

export type SalesReturnFormValues = z.infer<typeof salesReturnFormSchema>
