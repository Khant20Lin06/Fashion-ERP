import type { ProductVariant, VariantUomMapping, VariantUomUsageType } from "../types"
import type { TransactionUomOption } from "./VariantTransactionUomSelect"

export function buildTransactionUomOptions(
  variant: ProductVariant,
  mappings: VariantUomMapping[] | undefined,
  usage: Extract<VariantUomUsageType, "SALES" | "PURCHASE">,
): TransactionUomOption[] {
  const rows: TransactionUomOption[] = [
    {
      value: variant.baseUomId,
      label: variant.baseUom?.name ?? variant.baseUomId ?? "Base UOM",
      factor: 1,
      isBase: true,
    },
  ]

  for (const mapping of mappings ?? []) {
    if (!mapping.isActive || mapping.isBase) continue
    if (!(mapping.usageType === "BOTH" || mapping.usageType === usage)) continue
    rows.push({
      value: mapping.uomId,
      label: mapping.uomName ?? mapping.uomCode ?? mapping.uomId,
      factor: Number(mapping.conversionFactorToBase) || 1,
      isBase: false,
    })
  }

  const deduped = new Map<string, TransactionUomOption>()
  for (const option of rows) {
    deduped.set(option.value ?? "__base_uom__", option)
  }

  return Array.from(deduped.values())
}
