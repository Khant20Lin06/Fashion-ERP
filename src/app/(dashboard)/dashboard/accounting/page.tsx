"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FinanceCard, FinanceCardSkeleton } from "@/components/accounting/FinanceCard"
import { EmptyState } from "@/components/ui/empty-state"
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { IncomeExpenseChart } from "@/features/accounting/components/IncomeExpenseChart"
import { ReceivablePayableCard } from "@/features/accounting/components/ReceivablePayableCard"
import { RecentTransactionsCard } from "@/features/accounting/components/RecentTransactionsCard"
import { useFinanceKpis, useIncomeVsExpense } from "@/features/accounting/hooks/useLedger"
import { formatCurrency, formatPercent } from "@/lib/format"

export default function FinanceDashboardPage() {
  const { data: kpis, isLoading: loadingKpis, isError: kpisError } = useFinanceKpis()
  const { data: trend, isError: trendError } = useIncomeVsExpense()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance Dashboard</h1>
        <p className="text-sm text-muted-foreground">Revenue, expenses, profit, and cash position.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpisError ? (
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-base">Finance KPI Summary</CardTitle>
              <CardDescription>
                No backend accounting KPI aggregate endpoint exists yet, so this dashboard currently shows live receivables, payables, and payment activity below.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : loadingKpis || !kpis ? (
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
          {trendError && (
            <CardDescription>
              Time-series income and expense analytics are not available from the backend yet.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {trendError ? (
            <EmptyState
              title="Analytics not available yet"
              description="Live accounting transactions are available below, but the backend still has no income-vs-expense trend endpoint."
              className="border-none px-0 py-10"
            />
          ) : (
            <IncomeExpenseChart data={trend ?? []} />
          )}
        </CardContent>
      </Card>

      <ReceivablePayableCard />

      <RecentTransactionsCard />
    </div>
  )
}
