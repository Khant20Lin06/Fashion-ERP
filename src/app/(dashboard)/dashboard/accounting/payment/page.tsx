"use client"

import { Separator } from "@/components/ui/separator"
import { PaymentForm } from "@/features/accounting/components/PaymentForm"
import { PaymentList } from "@/features/accounting/components/PaymentList"

export default function PaymentManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment Management</h1>
        <p className="text-sm text-muted-foreground">Record and track payments through their lifecycle.</p>
      </div>

      <PaymentForm />

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Payments</h2>
        <PaymentList />
      </div>
    </div>
  )
}
