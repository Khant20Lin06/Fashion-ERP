"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Package, User, Receipt, Truck, Clock, X } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { useSearchStore } from "@/stores/search.store"
import { useGlobalSearch } from "../hooks/use-global-search"
import type { SearchResult, SearchResultType } from "../api/search.api"

const iconByType: Record<SearchResultType, React.ComponentType<{ className?: string }>> = {
  product: Package,
  customer: User,
  invoice: Receipt,
  supplier: Truck,
}

/**
 * Global search command palette — opens via the header search trigger or
 * the Ctrl/Cmd+K keyboard shortcut, available from anywhere in the app.
 * Debounces the query, remembers recent searches, and shows suggestions.
 */
export function GlobalSearch() {
  const isOpen = useSearchStore((s) => s.isOpen)
  const setOpen = useSearchStore((s) => s.setOpen)
  const recentSearches = useSearchStore((s) => s.recentSearches)
  const addRecentSearch = useSearchStore((s) => s.addRecentSearch)
  const clearRecentSearches = useSearchStore((s) => s.clearRecentSearches)

  const [query, setQuery] = useState("")
  const { data: results, isFetching } = useGlobalSearch(query)
  const router = useRouter()

  function handleOpenChange(open: boolean) {
    setOpen(open)
    if (!open) setQuery("")
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        handleOpenChange(!isOpen)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  function handleSelect(result: SearchResult) {
    addRecentSearch(result.title)
    handleOpenChange(false)
    router.push(result.href)
  }

  function handleRecentSelect(term: string) {
    setQuery(term)
  }

  const showRecent = query.trim().length === 0 && recentSearches.length > 0
  const groupedResults = groupByType(results ?? [])

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Global Search"
      description="Search products, customers, invoices, suppliers…"
    >
      <CommandInput
        placeholder="Search products, customers, invoices..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {showRecent && (
          <>
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((term) => (
                <CommandItem key={term} value={term} onSelect={() => handleRecentSelect(term)}>
                  <Clock className="text-muted-foreground" />
                  {term}
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="flex justify-end px-2 pb-1">
              <Button variant="ghost" size="sm" onClick={clearRecentSearches} className="h-auto gap-1 p-1 text-xs text-muted-foreground">
                <X className="size-3" /> Clear recent
              </Button>
            </div>
            <CommandSeparator />
          </>
        )}

        {!showRecent && query.trim().length > 0 && !isFetching && (!results || results.length === 0) && (
          <CommandEmpty>No results found for &ldquo;{query}&rdquo;</CommandEmpty>
        )}

        {Object.entries(groupedResults).map(([type, items]) => (
          <CommandGroup key={type} heading={typeLabel[type as SearchResultType]}>
            {items.map((item) => {
              const Icon = iconByType[item.type]
              return (
                <CommandItem key={item.id} value={item.title} onSelect={() => handleSelect(item)}>
                  <Icon className="text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}

const typeLabel: Record<SearchResultType, string> = {
  product: "Products",
  customer: "Customers",
  invoice: "Invoices",
  supplier: "Suppliers",
}

function groupByType(results: SearchResult[]): Partial<Record<SearchResultType, SearchResult[]>> {
  return results.reduce<Partial<Record<SearchResultType, SearchResult[]>>>((acc, item) => {
    acc[item.type] = [...(acc[item.type] ?? []), item]
    return acc
  }, {})
}
