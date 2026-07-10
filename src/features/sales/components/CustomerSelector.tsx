"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCustomers } from "../hooks/useCustomers"

type CustomerSelectorProps = {
  value: string | undefined
  onChange: (customerId: string | undefined) => void
  placeholder?: string
  allowWalkIn?: boolean
}

/** Dropdown for selecting a customer — reused across POS, Sales Order, and Return forms. */
export function CustomerSelector({ value, onChange, placeholder = "Select customer", allowWalkIn }: CustomerSelectorProps) {
  const { data: customers } = useCustomers()

  return (
    <Select
      value={value ?? (allowWalkIn ? "walk-in" : "")}
      onValueChange={(v) => onChange(v === "walk-in" ? undefined : v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowWalkIn && <SelectItem value="walk-in">Walk-in Customer</SelectItem>}
        {(customers ?? []).map((customer) => (
          <SelectItem key={customer.id} value={customer.id}>
            {customer.name} — {customer.phone}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
