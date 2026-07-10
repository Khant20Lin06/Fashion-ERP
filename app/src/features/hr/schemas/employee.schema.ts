import { z } from "zod"

export const employeeFormSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  photoUrl: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.email("Enter a valid email"),
  address: z.string().min(1, "Address is required"),
  employeeCode: z.string().min(1, "Employee ID is required"),
  departmentId: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  branchId: z.string().min(1, "Branch is required"),
  employmentType: z.enum(["full_time", "part_time", "contract", "intern"]),
  joiningDate: z.string().min(1, "Joining date is required"),
  managerId: z.string().optional(),
  shiftId: z.string().optional(),
  workingHoursPerWeek: z.number().min(0).max(168),
  location: z.string().min(1, "Location is required"),
  status: z.enum(["active", "on_leave", "suspended", "terminated"]),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
