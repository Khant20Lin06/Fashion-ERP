import type { ReactNode } from "react"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartSkeleton } from "@/components/ui/chart-skeleton"
import { EmptyState } from "@/components/ui/empty-state"

type ChartCardProps = {
  title: string
  action?: ReactNode
  isLoading?: boolean
  isEmpty?: boolean
  emptyDescription?: string
  children: ReactNode
}

/** Standard chart wrapper for report pages — title, optional header action, loading/empty states. */
export function ChartCard({ title, action, isLoading, isEmpty, emptyDescription, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : isEmpty ? (
          <EmptyState title="No data available" description={emptyDescription ?? "Try changing your filters."} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
