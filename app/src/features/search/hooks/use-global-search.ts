"use client"

import { useQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { searchGlobal } from "../api/search.api"

export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query, 250)

  return useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => searchGlobal(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30 * 1000,
  })
}
