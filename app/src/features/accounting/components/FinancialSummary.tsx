"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/format"
import { useBalanceSheet, useCashFlowStatement, useProfitAndLoss } from "../hooks/useLedger"
import type { BalanceSheetLine } from "../types"

function StatementRow({ label, amount, bold }: { label: string; amount: number; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${bold ? "font-semibold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{formatCurrency(amount)}</span>
    </div>
  )
}

function SectionLines({ lines }: { lines: BalanceSheetLine[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line) => (
        <StatementRow key={line.label} label={line.label} amount={line.amount} />
      ))}
    </div>
  )
}

/** Profit & Loss statement — Revenue, COGS, Gross Profit, Expenses, Net Profit. */
export function ProfitAndLossStatement() {
  const { data, isLoading } = useProfitAndLoss()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profit &amp; Loss</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading || !data ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <StatementRow label="Revenue" amount={data.revenue} />
            <StatementRow label="Cost of Goods Sold" amount={-data.costOfGoodsSold} />
            <Separator />
            <StatementRow label="Gross Profit" amount={data.grossProfit} bold />
            <StatementRow label="Expenses" amount={-data.expenses} />
            <Separator />
            <StatementRow label="Net Profit" amount={data.netProfit} bold />
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** Balance Sheet — Assets, Liabilities, Equity. */
export function BalanceSheetStatement() {
  const { data, isLoading } = useBalanceSheet()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Balance Sheet</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading || !data ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Assets</p>
              <SectionLines lines={data.assets} />
              <Separator />
              <StatementRow label="Total Assets" amount={data.totalAssets} bold />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Liabilities</p>
              <SectionLines lines={data.liabilities} />
              <Separator />
              <StatementRow label="Total Liabilities" amount={data.totalLiabilities} bold />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Equity</p>
              <SectionLines lines={data.equity} />
              <Separator />
              <StatementRow label="Total Equity" amount={data.totalEquity} bold />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** Cash Flow statement — Operating, Investing, Financing. */
export function CashFlowStatementCard() {
  const { data, isLoading } = useCashFlowStatement()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cash Flow</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading || !data ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Operating</p>
              <SectionLines lines={data.operating} />
              <Separator />
              <StatementRow label="Net Operating" amount={data.netOperating} bold />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Investing</p>
              <SectionLines lines={data.investing} />
              <Separator />
              <StatementRow label="Net Investing" amount={data.netInvesting} bold />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Financing</p>
              <SectionLines lines={data.financing} />
              <Separator />
              <StatementRow label="Net Financing" amount={data.netFinancing} bold />
            </div>
            <Separator />
            <StatementRow label="Net Change in Cash" amount={data.netChange} bold />
          </>
        )}
      </CardContent>
    </Card>
  )
}
