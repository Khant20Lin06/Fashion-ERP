"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountTree } from "@/components/accounting/AccountTree"
import { AccountFormDialog } from "@/features/accounting/components/AccountForm"
import type { Account } from "@/features/accounting/types"

export default function ChartOfAccountsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined)

  function openCreate() {
    setEditingAccount(undefined)
    setDialogOpen(true)
  }

  function openEdit(account: Account) {
    setEditingAccount(account)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground">Assets, Liabilities, Equity, Income, and Expense accounts.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Add Account
        </Button>
      </div>

      <AccountTree onSelect={openEdit} />

      <AccountFormDialog open={dialogOpen} onOpenChange={setDialogOpen} account={editingAccount} />
    </div>
  )
}
