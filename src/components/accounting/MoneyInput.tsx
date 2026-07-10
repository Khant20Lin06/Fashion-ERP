"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type MoneyInputProps = {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

/** Numeric currency input — used across Journal Entry, Payment, and Expense forms. */
export function MoneyInput({ value, onChange, placeholder = "0.00", className, disabled }: MoneyInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
      <Input
        type="number"
        min={0}
        step="0.01"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("pl-6", className)}
      />
    </div>
  )
}
