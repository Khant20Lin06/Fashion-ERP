import { z } from "zod"

const optionalCodeSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value
    const normalized = value.trim().toUpperCase()
    return normalized === "" ? undefined : normalized
  },
  z
    .string()
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, "Use uppercase letters, numbers, - and _ only")
    .optional()
)

const requiredCodeSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value
    return value.trim().toUpperCase()
  },
  z
    .string()
    .min(1, "Code is required")
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, "Use uppercase letters, numbers, - and _ only")
)

const optionalSwatchSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value
    const normalized = value.trim().toUpperCase()
    return normalized === "" ? undefined : normalized
  },
  z
    .string()
    .regex(/^#[0-9A-F]{6}$/, "Use a 6-digit hex color like #1A2B3C")
    .optional()
)

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
    baseUomId: z.string().optional(),
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
  baseUomId: z.string().optional(),
  status: z.enum(["active", "inactive"]),
})

export const productFormSchema = z.object({
  ...basicInfoSchema.shape,
  // maps to initialVariant.sku on create (CreateProductVariantDto, backend max length 100)
  sku: z.string().min(1, "SKU is required").max(100, "SKU must be 100 characters or fewer"),
  status: z.enum(["active", "draft", "archived"]),
  baseUomId: z.string().optional(),
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
  code: optionalCodeSchema,
  name: z.string().min(1, "Category name is required"),
  parentId: z.string().nullable(),
  isActive: z.boolean(),
})

export type CategoryFormInput = z.input<typeof categoryFormSchema>
export type CategoryFormValues = z.output<typeof categoryFormSchema>

export const brandFormSchema = z.object({
  code: optionalCodeSchema,
  name: z.string().min(1, "Brand name is required"),
  country: z.string().optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean(),
})

export type BrandFormInput = z.input<typeof brandFormSchema>
export type BrandFormValues = z.output<typeof brandFormSchema>

export const uomFormSchema = z.object({
  code: requiredCodeSchema,
  name: z.string().min(1, "UOM name is required").max(100),
  symbol: z.string().max(20).optional(),
  category: z.enum(["COUNT", "WEIGHT", "VOLUME", "LENGTH", "AREA"]),
  decimalPlaces: z.number().int().min(0).max(6),
  isActive: z.boolean(),
})

export type UomFormInput = z.input<typeof uomFormSchema>
export type UomFormValues = z.output<typeof uomFormSchema>

export const variantUomMappingFormSchema = z.object({
  uomId: z.string().min(1, "UOM is required"),
  conversionFactorToBase: z.string().regex(/^(?!0+(?:\.0+)?$)\d+(\.\d{1,4})?$/, "Use a positive conversion factor"),
  usageType: z.enum(["SALES", "PURCHASE", "BOTH"]),
  barcode: z.string().max(100).optional(),
  isActive: z.boolean(),
})

export type VariantUomMappingFormInput = z.input<typeof variantUomMappingFormSchema>
export type VariantUomMappingFormValues = z.output<typeof variantUomMappingFormSchema>

export const priceListFormSchema = z.object({
  code: requiredCodeSchema,
  name: z.string().min(1, "Price list name is required").max(200),
  description: z.string().max(500).optional(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter ISO code")
    .regex(/^[A-Z]{3}$/, "Use a 3-letter ISO code like USD"),
  isActive: z.boolean(),
})

export type PriceListFormInput = z.input<typeof priceListFormSchema>
export type PriceListFormValues = z.output<typeof priceListFormSchema>

export const priceListItemFormSchema = z
  .object({
    productVariantId: z.string().min(1, "Variant is required"),
    uomId: z.string().min(1, "UOM is required"),
    price: z.string().regex(/^(?!0+(?:\.0+)?$)\d+(\.\d{1,2})?$/, "Use a positive amount"),
    validFrom: z.string().min(1, "Valid from date is required"),
    validTo: z.string().optional(),
    isActive: z.boolean(),
  })
  .refine((value) => {
    if (!value.validTo) return true
    return new Date(value.validTo).getTime() > new Date(value.validFrom).getTime()
  }, {
    message: "Valid to must be after valid from",
    path: ["validTo"],
  })

export type PriceListItemFormInput = z.input<typeof priceListItemFormSchema>
export type PriceListItemFormValues = z.output<typeof priceListItemFormSchema>

export const attributeOptionFormSchema = z.object({
  value: z.string().min(1, "Value is required"),
  swatch: optionalSwatchSchema,
})

export type AttributeOptionFormInput = z.input<typeof attributeOptionFormSchema>
export type AttributeOptionFormValues = z.output<typeof attributeOptionFormSchema>
