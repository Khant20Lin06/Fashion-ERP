"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DiscountBadge } from "@/components/sales/DiscountBadge"
import { useDiscountRules } from "../hooks/useInvoice"

type DiscountSelectorProps = {
  value: string | undefined
  onChange: (ruleId: string | undefined) => void
}

/** Dropdown for applying an active discount rule — e.g. within the POS cart or a sales order line. */
export function DiscountSelector({ value, onChange }: DiscountSelectorProps) {
  const { data: rules } = useDiscountRules()
  const activeRules = (rules ?? []).filter((r) => r.isActive)
  const selected = activeRules.find((r) => r.id === value)

  return (
    <div className="flex items-center gap-2">
      <Select value={value ?? "none"} onValueChange={(v) => onChange(v === "none" ? undefined : v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Apply discount rule" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No discount</SelectItem>
          {activeRules.map((rule) => (
            <SelectItem key={rule.id} value={rule.id}>
              {rule.name} ({rule.percent}% OFF)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected && <DiscountBadge kind={selected.kind} percent={selected.percent} />}
    </div>
  )
}
