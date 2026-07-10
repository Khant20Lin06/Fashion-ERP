import { z } from "zod"

export const financePaymentFormSchema = z.object({
  direction: z.enum(["incoming", "outgoing"]),
  partyName: z.string().min(1, "Customer/Supplier is required"),
  relatedReference: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["cash", "bank_transfer", "card", "mobile_payment", "cheque"]),
  date: z.string().min(1, "Date is required"),
})

export type FinancePaymentFormValues = z.infer<typeof financePaymentFormSchema>
