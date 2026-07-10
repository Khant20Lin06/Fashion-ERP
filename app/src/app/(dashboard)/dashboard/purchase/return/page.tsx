"use client"

import { Separator } from "@/components/ui/separator"
import { PurchaseReturnForm } from "@/features/purchase/components/PurchaseReturnForm"
import { PurchaseReturnList } from "@/features/purchase/components/PurchaseReturnList"

export default function PurchaseReturnPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Purchase Return</h1>
        <p className="text-sm text-muted-foreground">Return damaged, incorrect, or unwanted stock to a supplier.</p>
      </div>

      <PurchaseReturnForm />

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Recent Returns</h2>
        <PurchaseReturnList />
      </div>
    </div>
  )
}
