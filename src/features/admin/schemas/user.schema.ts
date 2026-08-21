import { z } from "zod"

// CreateUserDto only accepts email/password/firstName/lastName/displayName
// — no phone/username/status field exists on User at all. roleId/
// companyId/branchId here drive separate assignment calls after create
// (see users.api.ts), not a single combined payload.
export const userFormSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  roleId: z.string().optional(),
  companyId: z.string().optional(),
  branchId: z.string().optional(),
})

export type UserFormValues = z.infer<typeof userFormSchema>
