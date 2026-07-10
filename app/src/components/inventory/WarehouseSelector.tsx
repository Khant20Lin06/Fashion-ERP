"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWarehouses } from "@/features/inventory/hooks/useWarehouse"

type WarehouseSelectorProps = {
  value: string | undefined
  onChange: (warehouseId: string) => void
  placeholder?: string
  disabled?: string[]
}

/** Dropdown for selecting a warehouse — reused across Transfer/Adjustment/Count forms and filters. */
export function WarehouseSelector({ value, onChange, placeholder = "Select warehouse", disabled }: WarehouseSelectorProps) {
  const { data: warehouses } = useWarehouses()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(warehouses ?? [])
          .filter((w) => !disabled?.includes(w.id))
          .map((warehouse) => (
            <SelectItem key={warehouse.id} value={warehouse.id}>
              {warehouse.name} ({warehouse.code})
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}
