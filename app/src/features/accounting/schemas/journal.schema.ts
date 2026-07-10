import { z } from "zod"

export const journalLineSchema = z
  .object({
    accountId: z.string().min(1, "Account is required"),
    accountName: z.string(),
    debit: z.number().min(0),
    credit: z.number().min(0),
    description: z.string().optional(),
  })
  .refine((line) => line.debit > 0 !== line.credit > 0, {
    message: "Each line must have either a debit or a credit, not both",
    path: ["debit"],
  })

export const journalEntryFormSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    reference: z.string().min(1, "Reference is required"),
    description: z.string().max(1000).optional(),
    lines: z.array(journalLineSchema).min(2, "A journal entry needs at least two lines"),
  })
  .refine(
    (entry) => {
      const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0)
      const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0)
      return Math.abs(totalDebit - totalCredit) < 0.005
    },
    { message: "Total debit must equal total credit", path: ["lines"] }
  )

export type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>
export type JournalLineValues = z.infer<typeof journalLineSchema>
