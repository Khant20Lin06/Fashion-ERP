"use client"

import { Separator } from "@/components/ui/separator"
import { PaymentForm } from "@/features/purchase/components/PaymentForm"
import { PaymentStatus } from "@/features/purchase/components/PaymentStatus"

export default function SupplierPaymentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Supplier Payment</h1>
        <p className="text-sm text-muted-foreground">
          Record payments only against receipt-matched invoices with remaining outstanding balance.
        </p>
      </div>

      <PaymentForm />

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Recent Payments</h2>
        <PaymentStatus />
      </div>
    </div>
  )
}
