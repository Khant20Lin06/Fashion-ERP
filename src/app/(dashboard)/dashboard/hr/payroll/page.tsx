"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PayrollEntryForm } from "@/features/hr/components/PayrollEntryForm"
import { PayrollTable } from "@/features/hr/components/PayrollTable"
import { usePayrollDashboardMetrics } from "@/features/hr/hooks/usePayroll"
import { formatCurrency } from "@/lib/format"

export default function PayrollPage() {
  const { data: metrics, isLoading } = usePayrollDashboardMetrics()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payroll Preparation</h1>
        <p className="text-sm text-muted-foreground">Calculate and process employee salaries.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !metrics ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : (
          <>
            <Card className="py-4">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">Total Salary</p>
                <p className="text-xl font-semibold">{formatCurrency(metrics.totalSalary)}</p>
              </CardContent>
            </Card>
            <Card className="py-4">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">Processed Payroll</p>
                <p className="text-xl font-semibold text-success">{formatCurrency(metrics.processedPayroll)}</p>
              </CardContent>
            </Card>
            <Card className="py-4">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">Pending Payroll</p>
                <p className="text-xl font-semibold text-warning">{formatCurrency(metrics.pendingPayroll)}</p>
              </CardContent>
            </Card>
            <Card className="py-4">
              <CardContent className="px-4">
                <p className="text-xs text-muted-foreground">Tax Deduction</p>
                <p className="text-xl font-semibold">{formatCurrency(metrics.taxDeduction)}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Payroll</TabsTrigger>
          <TabsTrigger value="new">New Entry</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <PayrollTable />
        </TabsContent>
        <TabsContent value="new" className="mt-4">
          <PayrollEntryForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
