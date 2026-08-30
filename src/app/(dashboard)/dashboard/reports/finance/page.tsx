"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { MetricCard, MetricCardSkeleton } from "@/components/reports/MetricCard"
import { useBranches } from "@/features/inventory/hooks/useWarehouse"
import { useFinancialOverview } from "@/features/reports/hooks/useReports"
import type { FinancialReportFilters, ProfitLossAccountRow } from "@/features/reports/types"
import { formatCurrency } from "@/lib/format"

type FilterDraft = {
  branchId: string
  fromDate: string
  toDate: string
}

const INITIAL_FILTERS: FilterDraft = {
  branchId: "all",
  fromDate: "",
  toDate: "",
}

function formatDateLabel(value: string | null) {
  if (!value) return "All time"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

function formatAppliedPeriod(fromDate: string | null, toDate: string | null) {
  if (!fromDate && !toDate) return "All posted dates"
  if (fromDate && toDate) return `${formatDateLabel(fromDate)} - ${formatDateLabel(toDate)}`
  if (fromDate) return `From ${formatDateLabel(fromDate)}`
  return `Until ${formatDateLabel(toDate)}`
}

function ProfitLossTableCard({
  title,
  description,
  rows,
  total,
  emptyTitle,
  emptyDescription,
}: {
  title: string
  description: string
  rows: ProfitLossAccountRow[]
  total: number
  emptyTitle: string
  emptyDescription: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            className="border-none px-0 py-10"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.accountId}>
                  <TableCell className="whitespace-normal font-medium">{row.accountName}</TableCell>
                  <TableCell className="font-mono text-xs">{row.accountCode}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(total)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function AnalyticsUnavailableCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          title="Backend analytics not available yet"
          description={description}
          className="border-none px-0 py-12"
        />
      </CardContent>
    </Card>
  )
}

export default function FinanceReportPage() {
  const { data: branches } = useBranches()
  const [draftFilters, setDraftFilters] = useState<FilterDraft>(INITIAL_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<FilterDraft>(INITIAL_FILTERS)

  const normalizedFilters = useMemo<FinancialReportFilters>(
    () => ({
      branchId: appliedFilters.branchId === "all" ? undefined : appliedFilters.branchId,
      fromDate: appliedFilters.fromDate || undefined,
      toDate: appliedFilters.toDate || undefined,
    }),
    [appliedFilters]
  )

  const {
    data: overview,
    isLoading: isLoadingOverview,
    isError,
    refetch,
  } = useFinancialOverview(normalizedFilters)

  const selectedBranchName =
    appliedFilters.branchId === "all"
      ? "All branches"
      : branches?.find((branch) => branch.id === appliedFilters.branchId)?.name ?? "Selected branch"

  const appliedSummary = overview
    ? `${formatAppliedPeriod(overview.fromDate, overview.toDate)} | ${selectedBranchName}`
    : `${formatAppliedPeriod(normalizedFilters.fromDate ?? null, normalizedFilters.toDate ?? null)} | ${selectedBranchName}`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Financial Reports</h1>
          <p className="text-sm text-muted-foreground">
            Posted revenue and expense journals only. Cost of goods sold, gross margin, and finance analytics still need backend support.
          </p>
        </div>
        <Badge variant="secondary" className="h-auto px-3 py-1 text-xs">
          {appliedSummary}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Apply branch and date filters to the live profit and loss summary.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch</label>
              <Select
                value={draftFilters.branchId}
                onValueChange={(value) => setDraftFilters((current) => ({ ...current, branchId: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All branches</SelectItem>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={draftFilters.fromDate}
                onChange={(event) => setDraftFilters((current) => ({ ...current, fromDate: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={draftFilters.toDate}
                onChange={(event) => setDraftFilters((current) => ({ ...current, toDate: event.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setAppliedFilters(draftFilters)}>Apply</Button>
            <Button
              variant="outline"
              onClick={() => {
                setDraftFilters(INITIAL_FILTERS)
                setAppliedFilters(INITIAL_FILTERS)
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-dashed border-border/70 bg-muted/20">
        <CardHeader>
          <CardTitle className="text-base">Release Scope Notice</CardTitle>
          <CardDescription>
            This page now shows the real profit and loss endpoint honestly. Only posted general-ledger revenue and expense lines are live today.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Live: revenue totals</Badge>
          <Badge variant="outline">Live: expense totals</Badge>
          <Badge variant="outline">Live: account breakdown</Badge>
          <Badge variant="outline">Gap: COGS split</Badge>
          <Badge variant="outline">Gap: trend analytics</Badge>
          <Badge variant="outline">Gap: margin analytics</Badge>
        </CardContent>
      </Card>

      {isError ? (
        <ErrorState
          message="Couldn't load the profit and loss summary."
          onRetry={() => {
            void refetch()
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoadingOverview || !overview ? (
              Array.from({ length: 4 }).map((_, index) => <MetricCardSkeleton key={index} />)
            ) : (
              <>
                <MetricCard
                  label="Revenue"
                  value={formatCurrency(overview.revenue)}
                  helper="Posted revenue accounts"
                />
                <MetricCard
                  label="Recognized Expenses"
                  value={formatCurrency(overview.expenses)}
                  helper="Posted expense accounts"
                />
                <MetricCard
                  label="Operating Result"
                  value={formatCurrency(overview.operatingResult)}
                  helper="Revenue less posted expenses"
                />
                <MetricCard
                  label="Net Income"
                  value={formatCurrency(overview.netProfit)}
                  helper="Current reported result"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <AnalyticsUnavailableCard
              title="Profit Trend"
              description="The backend has no time-series profit endpoint yet, so this chart stays hidden until Phase 2 analytics work lands."
            />
            <AnalyticsUnavailableCard
              title="Expense Breakdown"
              description="There is no backend category breakdown beyond account lines yet. Use the expense accounts table below for the live detail."
            />
            <AnalyticsUnavailableCard
              title="Margin Analysis"
              description="Gross margin and net margin by period depend on cost-of-goods-sold posting and analytics endpoints that are not implemented yet."
            />
          </div>

          {isLoadingOverview || !overview ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Expense Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ProfitLossTableCard
                title="Revenue Accounts"
                description="Live account-level revenue totals from posted journal entries."
                rows={overview.revenueRows}
                total={overview.revenue}
                emptyTitle="No revenue posted"
                emptyDescription="No posted revenue journal entries matched the selected filters."
              />
              <ProfitLossTableCard
                title="Expense Accounts"
                description="Live account-level expense totals from posted journal entries."
                rows={overview.expenseRows}
                total={overview.expenses}
                emptyTitle="No expenses posted"
                emptyDescription="No posted expense journal entries matched the selected filters."
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
