"use client"

import { FinanceCard, FinanceCardSkeleton } from "@/components/accounting/FinanceCard"
import { ReceivableTable } from "@/features/accounting/components/ReceivableTable"
import { useArMetrics } from "@/features/accounting/hooks/usePayments"
import { formatCurrency } from "@/lib/format"

export default function AccountsReceivablePage() {
  const { data: metrics, isLoading } = useArMetrics()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accounts Receivable</h1>
        <p className="text-sm text-muted-foreground">Outstanding customer invoices and collection status.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !metrics ? (
          Array.from({ length: 4 }).map((_, i) => <FinanceCardSkeleton key={i} />)
        ) : (
          <>
            <FinanceCard label="Total Outstanding" value={formatCurrency(metrics.totalOutstanding)} />
            <FinanceCard label="Overdue Amount" value={formatCurrency(metrics.overdueAmount)} tone="destructive" />
            <FinanceCard label="Paid Amount" value={formatCurrency(metrics.paidAmount)} tone="success" />
            <FinanceCard label="Customer Balance" value={formatCurrency(metrics.customerBalance)} />
          </>
        )}
      </div>

      <ReceivableTable />
    </div>
  )
}
