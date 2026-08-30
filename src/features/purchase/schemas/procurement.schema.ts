import { z } from "zod"

export const purchaseRfqItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string(),
  sku: z.string(),
  quantity: z.number().positive("Quantity must be greater than zero"),
  reason: z.string().min(1, "Reason is required"),
})

export const purchaseRfqFormSchema = z.object({
  purchaseRequestId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  requiredDate: z.string().min(1, "Required date is required"),
  invitedSupplierIds: z.array(z.string()).min(1, "Select at least one supplier"),
  items: z.array(purchaseRfqItemSchema).min(1, "Add at least one product"),
  notes: z.string().max(1000).optional(),
})

export type PurchaseRfqFormValues = z.infer<typeof purchaseRfqFormSchema>

export const supplierQuotationItemSchema = z.object({
  purchaseRfqItemId: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string(),
  sku: z.string(),
  quantity: z.number().positive(),
  unitCost: z.number().min(0),
  discount: z.number().min(0),
  tax: z.number().min(0),
})

export const supplierQuotationFormSchema = z.object({
  purchaseRfqId: z.string().min(1),
  supplierId: z.string().min(1, "Supplier is required"),
  paymentTermId: z.string().optional(),
  leadTimeDays: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(supplierQuotationItemSchema).min(1),
})

export type SupplierQuotationFormValues = z.infer<typeof supplierQuotationFormSchema>
