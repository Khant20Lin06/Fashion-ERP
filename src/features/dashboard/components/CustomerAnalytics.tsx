"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { StatCard, StatCardSkeleton } from "@/components/dashboard/StatCard"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { CategoryChart } from "@/components/charts/CategoryChart"
import { formatNumber, formatPercent } from "@/lib/format"
import type { CategoryBreakdownPoint, CustomerAnalyticsSummary } from "../types"

type CustomerAnalyticsProps = {
  summary: CustomerAnalyticsSummary | undefined
  categoryBreakdown: CategoryBreakdownPoint[] | undefined
  isLoading: boolean
  isError?: boolean
  onRetry?: () => void
}

export function CustomerAnalyticsWidget({
  summary,
  categoryBreakdown,
  isLoading,
  isError,
  onRetry,
}: CustomerAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Insights</CardTitle>
        <CardDescription>Customer base and product category mix</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Couldn't load customer analytics." onRetry={onRetry} />
        ) : !summary ? (
          <EmptyState title="No customer data available" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total Customers" value={formatNumber(summary.totalCustomers)} />
              <StatCard label="New This Month" value={formatNumber(summary.newCustomersThisMonth)} />
              <StatCard label="Loyalty Members" value={formatNumber(summary.loyaltyMembers)} />
              <StatCard label="Repeat Purchase Rate" value={formatPercent(summary.repeatPurchaseRate)} />
            </div>
            {categoryBreakdown && categoryBreakdown.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Sales by category</p>
                <CategoryChart data={categoryBreakdown} height={220} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
