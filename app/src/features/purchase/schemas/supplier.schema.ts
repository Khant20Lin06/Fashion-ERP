import { z } from "zod"

export const supplierFormSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  code: z.string().min(1, "Supplier code is required"),
  type: z.enum(["manufacturer", "wholesaler", "distributor", "agent"]),
  status: z.enum(["active", "inactive"]),
  contactPerson: z.string().min(1, "Contact person is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.email("Enter a valid email"),
  website: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country is required"),
  taxId: z.string().optional(),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  currency: z.string().min(1, "Currency is required"),
  bankAccount: z.string().optional(),
})

export type SupplierFormValues = z.infer<typeof supplierFormSchema>
