import { Banknote, CreditCard, Landmark, Smartphone } from "lucide-react"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import type { PaymentMethod, SupplierPayment } from "@/features/purchase/types"

const methodIcons: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  bank_transfer: Landmark,
  credit: CreditCard,
  mobile_payment: Smartphone,
}

const methodLabels: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  credit: "Credit",
  mobile_payment: "Mobile Payment",
}

type PaymentTimelineProps = {
  payments: SupplierPayment[]
}

/** Vertical timeline of payments made against a supplier or invoice. */
export function PaymentTimeline({ payments }: PaymentTimelineProps) {
  if (payments.length === 0) {
    return <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {payments.map((payment) => {
        const Icon = methodIcons[payment.method]
        return (
          <li key={payment.id} className="flex items-start gap-3">
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
              <Icon className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(payment.paymentDate)}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {methodLabels[payment.method]} · {payment.invoiceNumber}
                {payment.referenceNumber ? ` · Ref: ${payment.referenceNumber}` : ""}
              </p>
              {payment.notes && <p className="text-xs text-muted-foreground">{payment.notes}</p>}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
