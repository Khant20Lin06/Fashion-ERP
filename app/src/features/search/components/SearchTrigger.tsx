"use client"

import { Search } from "lucide-react"
import { useSearchStore } from "@/stores/search.store"

/** Header search input that opens the GlobalSearch command palette on click/focus. */
export function SearchTrigger() {
  const setOpen = useSearchStore((s) => s.setOpen)

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-muted/50"
    >
      <Search className="size-4 shrink-0" />
      <span className="flex-1 truncate text-left">Search products, customers, invoices...</span>
      <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium sm:inline-block">
        ⌘K
      </kbd>
    </button>
  )
}
