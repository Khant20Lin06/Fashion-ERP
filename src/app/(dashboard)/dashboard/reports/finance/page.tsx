"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard, MetricCardSkeleton } from "@/components/reports/MetricCard"
import { ProfitTrendChart, ExpenseBreakdownChart, MarginAnalysisChart } from "@/features/reports/charts/ProfitChart"
import {
  useExpenseBreakdown,
  useFinancialOverview,
  useMarginAnalysis,
  useProfitTrend,
} from "@/features/reports/hooks/useReports"
import { formatCurrency } from "@/lib/format"

export default function FinanceReportPage() {
  const { data: overview, isLoading: loadingOverview } = useFinancialOverview()
  const { data: profitTrend } = useProfitTrend()
  const { data: expenseData } = useExpenseBreakdown()
  const { data: marginData } = useMarginAnalysis()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financial Reports</h1>
        <p className="text-sm text-muted-foreground">Revenue, cost of goods sold, profit, and expenses.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loadingOverview || !overview ? (
          Array.from({ length: 5 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Revenue" value={formatCurrency(overview.revenue)} />
            <MetricCard label="Cost of Goods Sold" value={formatCurrency(overview.costOfGoodsSold)} />
            <MetricCard label="Gross Profit" value={formatCurrency(overview.grossProfit)} />
            <MetricCard label="Expenses" value={formatCurrency(overview.expenses)} />
            <MetricCard label="Net Profit" value={formatCurrency(overview.netProfit)} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfitTrendChart data={profitTrend ?? []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseBreakdownChart data={expenseData ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Margin Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <MarginAnalysisChart data={marginData ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
