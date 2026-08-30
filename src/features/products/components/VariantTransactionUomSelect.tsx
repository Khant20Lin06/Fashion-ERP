"use client"

import { useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVariantUoms } from "../hooks/useVariantUoms"
import type { ProductVariant, VariantUomUsageType } from "../types"
import { buildTransactionUomOptions } from "./variant-transaction-uom-options"

const BASE_UOM_SENTINEL = "__base_uom__"

export type TransactionUomOption = {
  value?: string
  label: string
  factor: number
  isBase: boolean
}

type VariantTransactionUomSelectProps = {
  variant: ProductVariant
  usage: Extract<VariantUomUsageType, "SALES" | "PURCHASE">
  value?: string
  options?: TransactionUomOption[]
  onChange: (nextUomId: string | undefined, option: TransactionUomOption) => void
}

export function VariantTransactionUomSelect({
  variant,
  usage,
  value,
  options: optionsOverride,
  onChange,
}: VariantTransactionUomSelectProps) {
  const { data } = useVariantUoms(variant.id)

  const options = useMemo(() => {
    return optionsOverride ?? buildTransactionUomOptions(variant, data, usage)
  }, [data, optionsOverride, usage, variant])

  const selectedValue = value ?? variant.baseUomId ?? BASE_UOM_SENTINEL

  return (
    <Select
      value={selectedValue}
      onValueChange={(nextValue) => {
        const option =
          options.find((candidate) => (candidate.value ?? BASE_UOM_SENTINEL) === nextValue) ?? options[0]
        onChange(option?.value, option ?? { value: undefined, label: "Base UOM", factor: 1, isBase: true })
      }}
    >
      <SelectTrigger className="w-full min-w-32">
        <SelectValue placeholder="Select UOM" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value ?? BASE_UOM_SENTINEL} value={option.value ?? BASE_UOM_SENTINEL}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
