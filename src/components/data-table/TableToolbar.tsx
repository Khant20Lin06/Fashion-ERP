"use client"

import type { Table } from "@tanstack/react-table"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExportButton } from "./ExportButton"
import { FilterPanel, type FilterFieldConfig, type FilterValues } from "./FilterPanel"
import type { BulkAction } from "./types"

type TableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  filterFields?: FilterFieldConfig[]
  filterValues?: FilterValues
  onFilterChange?: (values: FilterValues) => void
  bulkActions?: BulkAction<TData>[]
  exportFilename?: string
}

export function TableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  filterFields,
  filterValues,
  onFilterChange,
  bulkActions,
  exportFilename,
}: TableToolbarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((r) => r.original)
  const hasSelection = selectedRows.length > 0

  if (hasSelection && bulkActions && bulkActions.length > 0) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
        <span className="text-sm font-medium">{selectedRows.length} selected</span>
        <div className="flex flex-1 items-center gap-2">
          {bulkActions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant === "destructive" ? "destructive" : "outline"}
              onClick={() => action.onAction(selectedRows)}
            >
              {action.icon && <action.icon className="size-4" />}
              {action.label}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => table.resetRowSelection()}>
          <X className="size-4" />
          Clear
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        {filterFields && filterFields.length > 0 && onFilterChange && (
          <FilterPanel fields={filterFields} values={filterValues ?? {}} onChange={onFilterChange} />
        )}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="size-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ExportButton table={table} filename={exportFilename} />
      </div>
    </div>
  )
}
