"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TaxCalculator } from "@/features/accounting/components/TaxCalculator"
import { TaxRuleList } from "@/features/accounting/components/TaxRuleList"
import { TaxRuleFormDialog } from "@/features/accounting/components/TaxRuleForm"

export default function TaxManagementPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tax Management</h1>
          <p className="text-sm text-muted-foreground">VAT, Sales Tax, Purchase Tax, and Withholding Tax configuration.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus /> Add Tax Rule
        </Button>
      </div>

      <TaxCalculator />

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Tax Rules</h2>
        <TaxRuleList />
      </div>

      <TaxRuleFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
