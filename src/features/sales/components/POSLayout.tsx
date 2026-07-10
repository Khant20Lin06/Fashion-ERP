"use client"

import { useState } from "react"
import { POSProductGrid } from "./POSProductGrid"
import { CartPanel } from "./CartPanel"
import { PaymentPanel } from "./PaymentPanel"

/** Enterprise POS layout — product search/grid on the left, cart + payment on the right. */
export function POSLayout() {
  const [paymentOpen, setPaymentOpen] = useState(false)

  return (
    <div className="grid max-h-[calc(100vh-12rem)] grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
      <div className="min-h-0">
        <POSProductGrid />
      </div>
      <div className="min-h-0">
        <CartPanel onCheckout={() => setPaymentOpen(true)} />
      </div>
      <PaymentPanel open={paymentOpen} onOpenChange={setPaymentOpen} />
    </div>
  )
}
