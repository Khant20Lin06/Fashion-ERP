import { z } from "zod"

export const basicInfoSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  type: z.enum(["simple", "variant"]),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  collectionId: z.string().optional(),
  description: z.string().max(2000).optional(),
  season: z.enum(["spring_summer", "autumn_winter", "all_season"]),
  gender: z.enum(["men", "women", "kids", "unisex"]),
})

export const pricingSchema = z
  .object({
    costPrice: z.number().min(0, "Cost price must be positive"),
    sellingPrice: z.number().positive("Selling price must be positive"),
    discountPrice: z.number().min(0).optional(),
    wholesalePrice: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(100),
  })
  .refine((data) => data.sellingPrice >= data.costPrice, {
    message: "Selling price should not be lower than cost price",
    path: ["sellingPrice"],
  })

export const variantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().min(1, "Barcode is required"),
  attributes: z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    style: z.string().optional(),
    material: z.string().optional(),
  }),
  costPrice: z.number().min(0),
  sellingPrice: z.number().positive("Price must be positive"),
  stockQuantity: z.number().int().min(0),
  status: z.enum(["active", "inactive"]),
})

export const productFormSchema = z.object({
  ...basicInfoSchema.shape,
  sku: z.string().min(1, "SKU is required"),
  status: z.enum(["active", "draft", "archived"]),
  costPrice: z.number().min(0),
  sellingPrice: z.number().positive("Selling price must be positive"),
  discountPrice: z.number().min(0).optional(),
  wholesalePrice: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100),
  variants: z.array(variantSchema).optional(),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
export type VariantFormValues = z.infer<typeof variantSchema>

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parentId: z.string().nullable(),
  isActive: z.boolean(),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

export const brandFormSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  country: z.string().optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean(),
})

export type BrandFormValues = z.infer<typeof brandFormSchema>

export const attributeOptionFormSchema = z.object({
  value: z.string().min(1, "Value is required"),
  swatch: z.string().optional(),
})

export type AttributeOptionFormValues = z.infer<typeof attributeOptionFormSchema>
