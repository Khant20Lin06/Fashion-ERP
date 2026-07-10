import { z } from "zod"

export const purchaseRequestItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string(),
  sku: z.string(),
  color: z.string().optional(),
  size: z.string().optional(),
  quantity: z.number().positive("Quantity must be greater than zero"),
  reason: z.string().min(1, "Reason is required"),
})

export const purchaseRequestFormSchema = z.object({
  department: z.string().min(1, "Department is required"),
  requester: z.string().min(1, "Requester is required"),
  requiredDate: z.string().min(1, "Required date is required"),
  items: z.array(purchaseRequestItemSchema).min(1, "Add at least one product"),
  notes: z.string().max(1000).optional(),
})

export type PurchaseRequestFormValues = z.infer<typeof purchaseRequestFormSchema>
export type PurchaseRequestItemValues = z.infer<typeof purchaseRequestItemSchema>

export const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string(),
  sku: z.string(),
  color: z.string().optional(),
  size: z.string().optional(),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unitCost: z.number().positive("Cost price is required"),
  discount: z.number().min(0),
  tax: z.number().min(0),
})

export const purchaseOrderFormSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  contact: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  items: z.array(purchaseOrderItemSchema).min(1, "At least one product is required"),
})

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>
export type PurchaseOrderItemValues = z.infer<typeof purchaseOrderItemSchema>
