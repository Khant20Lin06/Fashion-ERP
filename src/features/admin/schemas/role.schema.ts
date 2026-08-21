import { z } from "zod"

// CreateRoleDto requires `code` (uppercase/digits/underscore) — no
// `permissionGroups` field on create; permissions are set afterward via
// the dedicated permission-assignment call.
export const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  code: z
    .string()
    .min(1, "Role code is required")
    .regex(/^[A-Z0-9_]+$/, "Code must be uppercase letters, numbers, and underscores only"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>

// CreateCompanyDto/UpdateCompanyDto real fields — no taxId/fiscalYearStart.
export const companyFormSchema = z.object({
  code: z
    .string()
    .min(1, "Company code is required")
    .regex(/^[A-Z0-9_-]+$/, "Code must be uppercase letters, numbers, - and _ only"),
  name: z.string().min(1, "Company name is required"),
  baseCurrency: z
    .string()
    .min(1, "Base currency is required")
    .regex(/^[A-Z]{3}$/, "Must be a 3-letter uppercase ISO currency code, e.g. USD"),
  timezone: z.string().min(1, "Timezone is required"),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]),
})

export type CompanyFormValues = z.infer<typeof companyFormSchema>

// CreateBranchDto/UpdateBranchDto real fields — no type/managerId/warehouseId.
export const branchFormSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  code: z
    .string()
    .min(1, "Branch code is required")
    .regex(/^[A-Z0-9_-]+$/, "Code must be uppercase letters, numbers, - and _ only"),
  companyId: z.string().min(1, "Company is required"),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  status: z.enum(["active", "inactive"]),
})

export type BranchFormValues = z.infer<typeof branchFormSchema>
