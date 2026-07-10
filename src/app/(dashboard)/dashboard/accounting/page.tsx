"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FinanceCard, FinanceCardSkeleton } from "@/components/accounting/FinanceCard"
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { IncomeExpenseChart } from "@/features/accounting/components/IncomeExpenseChart"
import { ReceivablePayableCard } from "@/features/accounting/components/ReceivablePayableCard"
import { RecentTransactionsCard } from "@/features/accounting/components/RecentTransactionsCard"
import { useFinanceKpis, useIncomeVsExpense } from "@/features/accounting/hooks/useLedger"
import { formatCurrency, formatPercent } from "@/lib/format"

export default function FinanceDashboardPage() {
  const { data: kpis, isLoading: loadingKpis } = useFinanceKpis()
  const { data: trend } = useIncomeVsExpense()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance Dashboard</h1>
        <p className="text-sm text-muted-foreground">Revenue, expenses, profit, and cash position.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingKpis || !kpis ? (
          Array.from({ length: 4 }).map((_, i) => <FinanceCardSkeleton key={i} />)
        ) : (
          <>
            <FinanceCard label="Total Revenue" value={formatCurrency(kpis.totalRevenue)} helper="This Year" icon={DollarSign} />
            <FinanceCard label="Total Expenses" value={formatCurrency(kpis.totalExpenses)} icon={TrendingDown} tone="warning" />
            <FinanceCard
              label="Net Profit"
              value={formatCurrency(kpis.netProfit)}
              helper={`${formatPercent(kpis.netMarginPercent)} Margin`}
              icon={TrendingUp}
              tone="success"
            />
            <FinanceCard label="Cash Balance" value={formatCurrency(kpis.cashBalance)} icon={Wallet} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Income vs Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeExpenseChart data={trend ?? []} />
        </CardContent>
      </Card>

      <ReceivablePayableCard />

      <RecentTransactionsCard />
    </div>
  )
}
