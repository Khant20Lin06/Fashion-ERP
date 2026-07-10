"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FinancePaymentMethod } from "@/features/accounting/types"

const methodOptions: { value: FinancePaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "mobile_payment", label: "Mobile Payment" },
  { value: "cheque", label: "Cheque" },
]

type PaymentMethodSelectorProps = {
  value: FinancePaymentMethod
  onChange: (method: FinancePaymentMethod) => void
}

/** Payment method dropdown — Cash / Bank Transfer / Card / Mobile Payment / Cheque. */
export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as FinancePaymentMethod)}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {methodOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
