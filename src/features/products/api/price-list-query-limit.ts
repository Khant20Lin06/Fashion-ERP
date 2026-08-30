export const MAX_PRICE_LIST_ITEMS_QUERY_LIMIT = 100

export function clampPriceListItemsLimit(limit?: number): number {
  if (!Number.isFinite(limit) || (limit as number) < 1) {
    return MAX_PRICE_LIST_ITEMS_QUERY_LIMIT
  }

  return Math.min(Math.trunc(limit as number), MAX_PRICE_LIST_ITEMS_QUERY_LIMIT)
}
