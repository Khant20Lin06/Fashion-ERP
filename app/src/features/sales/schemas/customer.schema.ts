import { z } from "zod"

export const customerFormSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  gender: z.enum(["male", "female", "other"]).optional(),
  birthday: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  email: z.email("Enter a valid email"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  customerGroup: z.string().min(1, "Customer group is required"),
  loyaltyMember: z.boolean(),
  preferredSize: z.string().optional(),
  preferredBrand: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>
