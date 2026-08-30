import { z } from "zod"

export const receiptLineSchema = z
  .object({
    // The originating PurchaseOrder line item's id — required by the
    // backend's CreateGoodsReceiptItemDto as purchaseOrderItemId. Carried
    // through from PurchaseLineItem.id when a line is populated from a
    // selected PO (see GoodsReceiptForm), never user-entered.
    purchaseOrderItemId: z.string().min(1),
    productId: z.string().min(1),
    productName: z.string(),
    sku: z.string(),
    color: z.string().optional(),
    size: z.string().optional(),
    orderedQty: z.number(),
    remainingQty: z.number().min(0),
    receivedQty: z.number().min(0),
    rejectedQty: z.number().min(0),
  })
  .refine((data) => data.receivedQty + data.rejectedQty > 0, {
    message: "Receive or reject at least 1 unit",
    path: ["receivedQty"],
  })
  .refine((data) => data.receivedQty + data.rejectedQty <= data.remainingQty, {
    message: "Received + rejected cannot exceed remaining quantity",
    path: ["receivedQty"],
  })

export const goodsReceiptFormSchema = z.object({
  purchaseOrderId: z.string().min(1, "Purchase order is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  receiptDate: z.string().min(1, "Receipt date is required"),
  notes: z.string().max(1000, "Notes must be 1000 characters or less").optional(),
  items: z.array(receiptLineSchema).min(1, "No items to receive"),
})

export type GoodsReceiptFormValues = z.infer<typeof goodsReceiptFormSchema>
export type ReceiptLineValues = z.infer<typeof receiptLineSchema>
