"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSuppliers } from "@/features/purchase/hooks/useSuppliers"

type SupplierSelectorProps = {
  value: string | undefined
  onChange: (supplierId: string) => void
  placeholder?: string
}

/** Dropdown for selecting a supplier — reused across PO/Payment/Return forms and filters. */
export function SupplierSelector({ value, onChange, placeholder = "Select supplier" }: SupplierSelectorProps) {
  const { data: suppliers } = useSuppliers()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(suppliers ?? []).map((supplier) => (
          <SelectItem key={supplier.id} value={supplier.id}>
            {supplier.name} ({supplier.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
