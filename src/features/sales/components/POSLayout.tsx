"use client"

import { useState } from "react"
import { POSProductGrid } from "./POSProductGrid"
import { CartPanel } from "./CartPanel"
import { PaymentPanel } from "./PaymentPanel"
import { buildPosLayoutClassName, buildPosPaneClassName } from "./pos-layout.classes"

/** Enterprise POS layout — product search/grid on the left, cart + payment on the right. */
export function POSLayout() {
  const [paymentOpen, setPaymentOpen] = useState(false)

  return (
    <div className={buildPosLayoutClassName()}>
      <div className={buildPosPaneClassName()}>
        <POSProductGrid />
      </div>
      <div className={buildPosPaneClassName()}>
        <CartPanel onCheckout={() => setPaymentOpen(true)} />
      </div>
      <PaymentPanel open={paymentOpen} onOpenChange={setPaymentOpen} />
    </div>
  )
}
