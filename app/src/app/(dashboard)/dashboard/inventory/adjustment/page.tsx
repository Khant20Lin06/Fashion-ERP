"use client"

import { Separator } from "@/components/ui/separator"
import { StockAdjustmentForm } from "@/features/inventory/components/StockAdjustmentForm"
import { AdjustmentList } from "@/features/inventory/components/AdjustmentList"

export default function StockAdjustmentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stock Adjustment</h1>
        <p className="text-sm text-muted-foreground">Correct inventory differences from damage, loss, or stock counts.</p>
      </div>

      <StockAdjustmentForm />

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Recent Adjustments</h2>
        <AdjustmentList />
      </div>
    </div>
  )
}
