export type PricedTransactionUomOption = {
  value?: string
  label: string
  factor: number
  isBase: boolean
}

export type PricedTransactionPriceListItem = {
  productVariantId: string
  uomId?: string
  validFrom: string
  validTo?: string
  status: "ACTIVE" | "INACTIVE"
}

type ResolvePricedTransactionUomOptionsArgs = {
  options: PricedTransactionUomOption[]
  priceListItems: PricedTransactionPriceListItem[]
  productVariantId: string
  transactionDate: string
}

function isEffectiveAt(item: PricedTransactionPriceListItem, atMs: number) {
  const validFromMs = Date.parse(item.validFrom)
  if (Number.isNaN(validFromMs) || validFromMs > atMs) {
    return false
  }

  if (!item.validTo) {
    return true
  }

  const validToMs = Date.parse(item.validTo)
  if (Number.isNaN(validToMs)) {
    return false
  }

  return validToMs > atMs
}

export function resolvePricedTransactionUomOptions({
  options,
  priceListItems,
  productVariantId,
  transactionDate,
}: ResolvePricedTransactionUomOptionsArgs): PricedTransactionUomOption[] {
  const atMs = Date.parse(transactionDate)
  if (Number.isNaN(atMs)) {
    return options
  }

  return options.filter((option) =>
    priceListItems.some((item) => {
      if (item.productVariantId !== productVariantId) {
        return false
      }
      if (item.status !== "ACTIVE") {
        return false
      }
      if (!isEffectiveAt(item, atMs)) {
        return false
      }

      const rowUomId = item.uomId ?? undefined
      if (rowUomId === option.value) {
        return true
      }

      return option.isBase && rowUomId === undefined
    }),
  )
}
