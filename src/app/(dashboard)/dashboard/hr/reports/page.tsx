"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DepartmentCostChart,
  HeadcountGrowthChart,
  LateAbsenceTrendChart,
  SalaryCostChart,
  TurnoverTrendChart,
} from "@/features/hr/components/HrCharts"
import {
  useAbsenceTrend,
  useDepartmentCost,
  useHeadcountGrowth,
  useLateTrend,
  useSalaryCostTrend,
  useTurnoverTrend,
} from "@/features/hr/hooks/usePayroll"

// No backend HR analytics endpoint of any kind exists (confirmed BACKEND
// GAP) — every query here will genuinely fail (404) against the real API,
// so `isError` must be shown as "not available," never silently rendered
// as an empty chart (which would look identical to "no data yet").
function ChartCard({
  title,
  isLoading,
  isError,
  children,
}: {
  title: string
  isLoading: boolean
  isError: boolean
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : isError ? (
          <EmptyState title="Not available" description="No backend endpoint provides this analytic yet." />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

export default function HrReportsPage() {
  const { data: headcount, isLoading: headcountLoading, isError: headcountError } = useHeadcountGrowth()
  const { data: turnover, isLoading: turnoverLoading, isError: turnoverError } = useTurnoverTrend()
  const { data: lateTrend, isLoading: lateLoading, isError: lateError } = useLateTrend()
  const { data: absenceTrend, isLoading: absenceLoading, isError: absenceError } = useAbsenceTrend()
  const { data: salaryCost, isLoading: salaryCostLoading, isError: salaryCostError } = useSalaryCostTrend()
  const { data: departmentCost, isLoading: departmentCostLoading, isError: departmentCostError } = useDepartmentCost()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">HR Analytics</h1>
        <p className="text-sm text-muted-foreground">Employee, attendance, and payroll analytics.</p>
      </div>

      <Tabs defaultValue="employee">
        <TabsList>
          <TabsTrigger value="employee">Employee Analytics</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Analytics</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="employee" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Headcount Growth" isLoading={headcountLoading} isError={headcountError}>
            <HeadcountGrowthChart data={headcount ?? []} />
          </ChartCard>
          <ChartCard title="Turnover Rate" isLoading={turnoverLoading} isError={turnoverError}>
            <TurnoverTrendChart data={turnover ?? []} />
          </ChartCard>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4 grid grid-cols-1 gap-4">
          <ChartCard title="Late & Absence Trends" isLoading={lateLoading || absenceLoading} isError={lateError || absenceError}>
            <LateAbsenceTrendChart lateData={lateTrend ?? []} absenceData={absenceTrend ?? []} />
          </ChartCard>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Salary Cost Trend" isLoading={salaryCostLoading} isError={salaryCostError}>
            <SalaryCostChart data={salaryCost ?? []} />
          </ChartCard>
          <ChartCard title="Department Cost" isLoading={departmentCostLoading} isError={departmentCostError}>
            <DepartmentCostChart data={departmentCost ?? []} />
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
