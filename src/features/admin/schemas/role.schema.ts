import { z } from "zod"

export const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().min(1, "Description is required"),
  permissionGroups: z.array(z.string()).min(1, "At least one permission group is required"),
  status: z.enum(["active", "inactive"]),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>

export const companyFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  taxId: z.string().min(1, "Tax ID is required"),
  currency: z.string().min(1, "Currency is required"),
  fiscalYearStart: z.string().min(1, "Fiscal year start is required"),
  address: z.string().min(1, "Address is required"),
  status: z.enum(["active", "inactive"]),
})

export type CompanyFormValues = z.infer<typeof companyFormSchema>

export const branchFormSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  code: z.string().min(1, "Branch code is required"),
  companyId: z.string().min(1, "Company is required"),
  type: z.enum(["head_office", "retail_store", "warehouse", "outlet"]),
  address: z.string().min(1, "Address is required"),
  managerId: z.string().optional(),
  warehouseId: z.string().optional(),
  status: z.enum(["active", "inactive"]),
})

export type BranchFormValues = z.infer<typeof branchFormSchema>
