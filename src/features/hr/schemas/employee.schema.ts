import { z } from "zod"

export const employeeFormSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  dateOfBirth: z.string(),
  phone: z.string().trim(),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  address: z.string().trim(),
  employeeCode: z.string().trim().min(1, "Employee ID is required"),
  departmentId: z.string().min(1, "Department is required"),
  designationId: z.string(),
  branchId: z.string().min(1, "Branch is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
