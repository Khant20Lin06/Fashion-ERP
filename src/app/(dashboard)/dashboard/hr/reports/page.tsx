"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

function ChartCard({ title, isLoading, children }: { title: string; isLoading: boolean; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{isLoading ? <Skeleton className="h-64 w-full" /> : children}</CardContent>
    </Card>
  )
}

export default function HrReportsPage() {
  const { data: headcount, isLoading: headcountLoading } = useHeadcountGrowth()
  const { data: turnover, isLoading: turnoverLoading } = useTurnoverTrend()
  const { data: lateTrend, isLoading: lateLoading } = useLateTrend()
  const { data: absenceTrend, isLoading: absenceLoading } = useAbsenceTrend()
  const { data: salaryCost, isLoading: salaryCostLoading } = useSalaryCostTrend()
  const { data: departmentCost, isLoading: departmentCostLoading } = useDepartmentCost()

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
          <ChartCard title="Headcount Growth" isLoading={headcountLoading}>
            <HeadcountGrowthChart data={headcount ?? []} />
          </ChartCard>
          <ChartCard title="Turnover Rate" isLoading={turnoverLoading}>
            <TurnoverTrendChart data={turnover ?? []} />
          </ChartCard>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4 grid grid-cols-1 gap-4">
          <ChartCard title="Late & Absence Trends" isLoading={lateLoading || absenceLoading}>
            <LateAbsenceTrendChart lateData={lateTrend ?? []} absenceData={absenceTrend ?? []} />
          </ChartCard>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Salary Cost Trend" isLoading={salaryCostLoading}>
            <SalaryCostChart data={salaryCost ?? []} />
          </ChartCard>
          <ChartCard title="Department Cost" isLoading={departmentCostLoading}>
            <DepartmentCostChart data={departmentCost ?? []} />
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
