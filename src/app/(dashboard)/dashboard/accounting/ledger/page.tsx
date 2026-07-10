"use client"

import { useMemo } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LedgerTable } from "@/components/accounting/LedgerTable"
import { useAccounts } from "@/features/accounting/hooks/useAccounts"
import { useLedgerEntries } from "@/features/accounting/hooks/useLedger"
import { useAccountingStore } from "@/features/accounting/stores/accounting.store"

export default function GeneralLedgerPage() {
  const { data: entries, isLoading, isError, refetch } = useLedgerEntries()
  const { data: accounts } = useAccounts()
  const { filters, setFilter } = useAccountingStore()

  const filteredEntries = useMemo(() => {
    if (!entries) return []
    if (!filters.account) return entries
    return entries.filter((entry) => entry.accountId === filters.account)
  }, [entries, filters.account])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">General Ledger</h1>
          <p className="text-sm text-muted-foreground">Every posted debit and credit across all accounts.</p>
        </div>
        <div className="flex gap-2">
          <Select value={filters.account ?? "all"} onValueChange={(v) => setFilter("account", v === "all" ? undefined : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {(accounts ?? []).map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> Print
          </Button>
        </div>
      </div>

      <LedgerTable data={filteredEntries} isLoading={isLoading} isError={isError} onRetry={refetch} />
    </div>
  )
}
