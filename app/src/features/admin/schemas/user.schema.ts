import { z } from "zod"

export const userFormSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.email("Enter a valid email address"),
  phone: z.string().min(1, "Phone is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  roleId: z.string().min(1, "Role is required"),
  companyId: z.string().min(1, "Company is required"),
  branchId: z.string().min(1, "Branch is required"),
  status: z.enum(["active", "inactive", "locked", "pending"]),
})

export type UserFormValues = z.infer<typeof userFormSchema>
