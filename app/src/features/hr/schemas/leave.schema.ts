import { z } from "zod"

export const leaveRequestFormSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    type: z.enum(["annual", "sick", "emergency", "unpaid", "maternity"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().min(1, "Reason is required").max(1000),
    attachmentFilename: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  })

export type LeaveRequestFormValues = z.infer<typeof leaveRequestFormSchema>
