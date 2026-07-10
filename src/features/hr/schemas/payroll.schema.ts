import { z } from "zod"

export const payrollEntryFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  period: z.string().min(1, "Period is required"),
  basicSalary: z.number().positive("Basic salary must be positive"),
  allowance: z.number().min(0),
  bonus: z.number().min(0),
  deduction: z.number().min(0),
  tax: z.number().min(0),
})

export type PayrollEntryFormValues = z.infer<typeof payrollEntryFormSchema>

export function calculateNetSalary(values: {
  basicSalary: number
  allowance: number
  bonus: number
  deduction: number
  tax: number
}): number {
  return values.basicSalary + values.allowance + values.bonus - values.deduction - values.tax
}
