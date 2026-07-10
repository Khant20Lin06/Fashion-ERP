import { z } from "zod"

export const expenseFormSchema = z.object({
  category: z.enum(["salary", "rent", "utilities", "marketing", "transport", "maintenance"]),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  method: z.enum(["cash", "bank_transfer", "card", "mobile_payment", "cheque"]),
  description: z.string().min(1, "Description is required").max(1000),
  receiptFilename: z.string().optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>
