import { z } from "zod"

export const paymentFormSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  invoiceId: z.string().min(1, "Invoice is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  method: z.enum(["cash", "bank_transfer", "credit", "mobile_payment"]),
  referenceNumber: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

export type PaymentFormValues = z.infer<typeof paymentFormSchema>

export const purchaseReturnFormSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  purchaseOrderId: z.string().optional(),
  reason: z.enum(["damaged_product", "wrong_item", "quality_issue", "supplier_return"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        productName: z.string(),
        sku: z.string(),
        color: z.string().optional(),
        size: z.string().optional(),
        quantity: z.number().positive("Quantity must be greater than zero"),
        unitCost: z.number().min(0),
      })
    )
    .min(1, "Add at least one product"),
  notes: z.string().max(1000).optional(),
})

export type PurchaseReturnFormValues = z.infer<typeof purchaseReturnFormSchema>
