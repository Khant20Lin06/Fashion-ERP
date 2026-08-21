"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PayrollPeriodTable } from "@/features/payroll/components/PayrollPeriodTable"
import { PayrollPeriodFormDialog } from "@/features/payroll/components/PayrollPeriodForm"
import { PayrollRunTable } from "@/features/payroll/components/PayrollRunTable"
import { PayrollComponentTable } from "@/features/payroll/components/PayrollComponentTable"
import { PayrollComponentFormDialog } from "@/features/payroll/components/PayrollComponentForm"
import { PayrollConfigurationForm } from "@/features/payroll/components/PayrollConfigurationForm"

export default function PayrollPage() {
  const [periodFormOpen, setPeriodFormOpen] = useState(false)
  const [componentFormOpen, setComponentFormOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
        <p className="text-sm text-muted-foreground">
          Payroll periods, runs, earning/deduction components, and configuration.
        </p>
      </div>

      <Tabs defaultValue="periods">
        <TabsList>
          <TabsTrigger value="periods">Periods</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="periods" className="mt-4 flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={() => setPeriodFormOpen(true)}>
              <Plus /> New Period
            </Button>
          </div>
          <PayrollPeriodTable />
          <PayrollPeriodFormDialog open={periodFormOpen} onOpenChange={setPeriodFormOpen} />
        </TabsContent>

        <TabsContent value="runs" className="mt-4">
          <PayrollRunTable />
        </TabsContent>

        <TabsContent value="components" className="mt-4 flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={() => setComponentFormOpen(true)}>
              <Plus /> New Component
            </Button>
          </div>
          <PayrollComponentTable />
          <PayrollComponentFormDialog open={componentFormOpen} onOpenChange={setComponentFormOpen} />
        </TabsContent>

        <TabsContent value="configuration" className="mt-4">
          <PayrollConfigurationForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
