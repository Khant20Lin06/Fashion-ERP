import { z } from "zod"

const optionalSupplierCodeSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value
    const normalized = value.trim().toUpperCase()
    return normalized === "" ? undefined : normalized
  },
  z
    .string()
    .max(50, "Supplier code must be 50 characters or fewer")
    .regex(/^[A-Z0-9_-]+$/, {
      message: "Supplier code can contain only uppercase letters, numbers, - and _",
    })
    .optional()
)

export const supplierFormSchema = z.object({
  name: z.string().trim().min(1, "Supplier name is required").max(200, "Supplier name must be 200 characters or fewer"),
  code: optionalSupplierCodeSchema,
  type: z.enum(["manufacturer", "wholesaler", "distributor", "agent"]),
  status: z.enum(["active", "inactive", "blocked"]),
  contactPerson: z.string().trim().max(200, "Contact person must be 200 characters or fewer"),
  phone: z.string().trim().max(50, "Phone must be 50 characters or fewer"),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  paymentTermId: z.string(),
  creditDays: z.number().int().min(0, "Credit days cannot be negative").max(3650, "Credit days is too large"),
  openingBalanceAmount: z
    .string()
    .trim()
    .min(1, "Opening balance is required")
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
      message: 'Opening balance must be a non-negative amount like "0.00"',
    }),
  notes: z.string().trim().max(1000, "Notes must be 1000 characters or fewer"),
})

export type SupplierFormInput = z.input<typeof supplierFormSchema>
export type SupplierFormValues = z.output<typeof supplierFormSchema>
