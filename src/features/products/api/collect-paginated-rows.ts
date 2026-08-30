export type PaginatedRowsMeta = {
  page: number
  limit: number
  total: number
}

export async function collectPaginatedRows<TRow>({
  limit,
  fetchPage,
  keyOf,
}: {
  limit: number
  fetchPage: (page: number, limit: number) => Promise<{
    rows: TRow[]
    meta?: PaginatedRowsMeta
  }>
  keyOf?: (row: TRow) => string
}): Promise<TRow[]> {
  const rows: TRow[] = []
  const seenKeys = keyOf ? new Set<string>() : undefined
  let page = 1

  while (true) {
    const result = await fetchPage(page, limit)
    for (const row of result.rows) {
      if (!seenKeys || !keyOf) {
        rows.push(row)
        continue
      }

      const key = keyOf(row)
      if (seenKeys.has(key)) {
        continue
      }

      seenKeys.add(key)
      rows.push(row)
    }

    const total = result.meta?.total
    if (total !== undefined && rows.length >= total) {
      return rows.slice(0, total)
    }

    if (result.rows.length < limit || result.rows.length === 0) {
      return rows
    }

    page += 1
  }
}
