import { z } from "zod"

export const transferLineSchema = z
  .object({
    productId: z.string().min(1, "Product is required"),
    productName: z.string(),
    sku: z.string(),
    variantLabel: z.string().optional(),
    availableQty: z.number(),
    transferQty: z.number().positive("Transfer quantity must be greater than zero"),
  })
  .refine((data) => data.transferQty <= data.availableQty, {
    message: "Transfer quantity cannot exceed available stock",
    path: ["transferQty"],
  })

export const transferFormSchema = z
  .object({
    fromWarehouseId: z.string().min(1, "From warehouse is required"),
    toWarehouseId: z.string().min(1, "To warehouse is required"),
    items: z.array(transferLineSchema).min(1, "Add at least one product to transfer"),
  })
  .refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
    message: "From and To warehouses must be different",
    path: ["toWarehouseId"],
  })

export type TransferFormValues = z.infer<typeof transferFormSchema>
export type TransferLineValues = z.infer<typeof transferLineSchema>
