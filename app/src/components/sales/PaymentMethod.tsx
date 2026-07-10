"use client"

import { Banknote, CreditCard, Landmark, Smartphone, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PaymentMethod as PaymentMethodType } from "@/features/sales/types"

const methods: { value: PaymentMethodType; label: string; icon: typeof Banknote }[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: Landmark },
  { value: "mobile_payment", label: "Mobile Payment", icon: Smartphone },
  { value: "credit", label: "Credit", icon: Wallet },
]

type PaymentMethodSelectorProps = {
  value: PaymentMethodType
  onChange: (method: PaymentMethodType) => void
}

/** Payment method picker — grid of tappable method tiles for POS checkout. */
export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {methods.map((method) => {
        const Icon = method.icon
        const isSelected = value === method.value
        return (
          <button
            key={method.value}
            type="button"
            onClick={() => onChange(method.value)}
            aria-pressed={isSelected}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors",
              isSelected ? "border-primary bg-primary/5 text-primary" : "border-input hover:bg-accent/50"
            )}
          >
            <Icon className="size-5" />
            {method.label}
          </button>
        )
      })}
    </div>
  )
}
