"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { FeatureUnavailable } from "@/components/feature-gate/FeatureUnavailable"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/format"
import { useBalanceSheet, useCashFlowStatement, useProfitAndLoss, useTrialBalance } from "../hooks/useLedger"
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
  const { data, isLoading, isError, refetch } = useProfitAndLoss()

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profit &amp; Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Couldn't load the profit and loss statement." onRetry={refetch} />
        </CardContent>
      </Card>
    )
  }

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
  const { data, isLoading, isError, refetch } = useBalanceSheet()

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Couldn't load the balance sheet." onRetry={refetch} />
        </CardContent>
      </Card>
    )
  }

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
  const { data, isLoading, isError } = useCashFlowStatement()

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureUnavailable
            title="Cash flow statement not available"
            description="No backend cash-flow-statement endpoint exists yet."
          />
        </CardContent>
      </Card>
    )
  }

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

/** Trial Balance — SUM(debit)/SUM(credit) per account, backend-computed over POSTED journal lines. */
export function TrialBalanceStatement() {
  const { data, isLoading, isError, refetch } = useTrialBalance()

  if (isLoading) return <Skeleton className="h-56 w-full" />

  if (isError) return <ErrorState message="Couldn't load trial balance." onRetry={refetch} />

  if (!data || data.rows.length === 0) {
    return <EmptyState title="No posted activity" description="Post a journal entry to see it reflected here." />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trial Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.accountId}>
                <TableCell className="font-mono text-xs">{row.accountCode}</TableCell>
                <TableCell>{row.accountName}</TableCell>
                <TableCell className="text-right">
                  {row.totalDebit > 0 ? formatCurrency(row.totalDebit) : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  {row.totalCredit > 0 ? formatCurrency(row.totalCredit) : <span className="text-muted-foreground">—</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-semibold">Total</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(data.totalDebit)}</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(data.totalCredit)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
