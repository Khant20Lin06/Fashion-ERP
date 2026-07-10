"use client"

import { Separator } from "@/components/ui/separator"
import { ReturnForm } from "@/features/sales/components/ReturnForm"
import { ReturnList } from "@/features/sales/components/ReturnList"

export default function SalesReturnsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Returns & Refund</h1>
        <p className="text-sm text-muted-foreground">Process product returns, exchanges, and refunds.</p>
      </div>

      <ReturnForm />

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Return Requests</h2>
        <ReturnList />
      </div>
    </div>
  )
}
