import { z } from "zod"

export const receiptLineSchema = z
  .object({
    productId: z.string().min(1),
    productName: z.string(),
    sku: z.string(),
    color: z.string().optional(),
    size: z.string().optional(),
    orderedQty: z.number(),
    receivedQty: z.number().min(0),
    rejectedQty: z.number().min(0),
  })
  .refine((data) => data.receivedQty + data.rejectedQty <= data.orderedQty, {
    message: "Received + rejected cannot exceed ordered quantity",
    path: ["receivedQty"],
  })

export const goodsReceiptFormSchema = z.object({
  purchaseOrderId: z.string().min(1, "Purchase order is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  items: z.array(receiptLineSchema).min(1, "No items to receive"),
})

export type GoodsReceiptFormValues = z.infer<typeof goodsReceiptFormSchema>
export type ReceiptLineValues = z.infer<typeof receiptLineSchema>
