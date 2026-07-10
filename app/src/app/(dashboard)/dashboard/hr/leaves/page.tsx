"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaveForm } from "@/features/hr/components/LeaveForm"
import { LeaveList } from "@/features/hr/components/LeaveList"
import { useLeaveDashboardMetrics } from "@/features/hr/hooks/useLeave"
import { formatNumber } from "@/lib/format"

export default function LeavesPage() {
  const { data: metrics, isLoading } = useLeaveDashboardMetrics()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leave Management</h1>
        <p className="text-sm text-muted-foreground">Submit and approve employee leave requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !metrics ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : (
          <>
            <Card className="py-4">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">Total Requests</p>
                <p className="text-xl font-semibold">{formatNumber(metrics.totalRequests)}</p>
              </CardContent>
            </Card>
            <Card className="py-4">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold text-warning">{formatNumber(metrics.pending)}</p>
              </CardContent>
            </Card>
            <Card className="py-4">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-xl font-semibold text-success">{formatNumber(metrics.approved)}</p>
              </CardContent>
            </Card>
            <Card className="py-4">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-xl font-semibold text-destructive">{formatNumber(metrics.rejected)}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">New Request</TabsTrigger>
          <TabsTrigger value="list">All Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-4">
          <LeaveForm />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <LeaveList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
