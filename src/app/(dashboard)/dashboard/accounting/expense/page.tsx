"use client"

import { Separator } from "@/components/ui/separator"
import { ExpenseForm } from "@/features/accounting/components/ExpenseForm"
import { ExpenseList } from "@/features/accounting/components/ExpenseList"

export default function ExpenseManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Expense Management</h1>
        <p className="text-sm text-muted-foreground">Submit and approve business expenses.</p>
      </div>

      <ExpenseForm />

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Expenses</h2>
        <ExpenseList />
      </div>
    </div>
  )
}
