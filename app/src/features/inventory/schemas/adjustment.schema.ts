import { z } from "zod"

export const adjustmentFormSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse is required"),
  productId: z.string().min(1, "Product is required"),
  currentQty: z.number().min(0),
  adjustedQty: z.number().min(0, "Adjusted quantity must be zero or greater"),
  type: z.enum([
    "stock_count_difference",
    "damaged_product",
    "lost_item",
    "expired_item",
    "manual_correction",
  ]),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().max(1000).optional(),
})

export type AdjustmentFormValues = z.infer<typeof adjustmentFormSchema>
