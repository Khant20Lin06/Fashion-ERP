"use client"

import { FinanceCard, FinanceCardSkeleton } from "@/components/accounting/FinanceCard"
import { PayableTable } from "@/features/accounting/components/PayableTable"
import { useApMetrics } from "@/features/accounting/hooks/usePayments"
import { formatCurrency } from "@/lib/format"

export default function AccountsPayablePage() {
  const { data: metrics, isLoading } = useApMetrics()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accounts Payable</h1>
        <p className="text-sm text-muted-foreground">Outstanding supplier invoices and payment obligations.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !metrics ? (
          Array.from({ length: 4 }).map((_, i) => <FinanceCardSkeleton key={i} />)
        ) : (
          <>
            <FinanceCard label="Outstanding Payable" value={formatCurrency(metrics.outstandingPayable)} />
            <FinanceCard label="Due This Week" value={formatCurrency(metrics.dueThisWeek)} tone="warning" />
            <FinanceCard label="Paid Amount" value={formatCurrency(metrics.paidAmount)} tone="success" />
            <FinanceCard label="Supplier Balance" value={formatCurrency(metrics.supplierBalance)} />
          </>
        )}
      </div>

      <PayableTable />
    </div>
  )
}
