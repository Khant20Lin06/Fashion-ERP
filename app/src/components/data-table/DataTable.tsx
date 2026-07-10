"use client"

import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { TableToolbar } from "./TableToolbar"
import { Pagination } from "./Pagination"
import type { FilterFieldConfig, FilterValues } from "./FilterPanel"
import type { BulkAction, DataTableColumnDef } from "./types"

type DataTableProps<TData, TValue> = {
  columns: DataTableColumnDef<TData, TValue>[]
  data: TData[] | undefined
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  searchPlaceholder?: string
  filterFields?: FilterFieldConfig[]
  filterValues?: FilterValues
  onFilterChange?: (values: FilterValues) => void
  bulkActions?: BulkAction<TData>[]
  exportFilename?: string
  enableRowSelection?: boolean
  pageSize?: number
}

/**
 * The platform's single enterprise data table — every product/order/
 * customer/inventory list consumes this component with a column config,
 * rather than each screen hand-building sorting/filtering/pagination.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isError,
  onRetry,
  emptyTitle = "No results found",
  emptyDescription,
  searchPlaceholder,
  filterFields,
  filterValues,
  onFilterChange,
  bulkActions,
  exportFilename,
  enableRowSelection = false,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, columnVisibility, rowSelection, globalFilter },
    enableRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const columnCount = columns.length

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        filterFields={filterFields}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        bulkActions={bulkActions}
        exportFilename={exportFilename}
      />

      {isLoading ? (
        <TableSkeleton rows={pageSize > 8 ? 8 : pageSize} columns={columnCount} />
      ) : isError ? (
        <ErrorState message="Couldn't load this data." onRetry={onRetry} />
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columnCount} className="h-auto p-0">
                      <EmptyState title={emptyTitle} description={emptyDescription} className="border-none" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {table.getRowModel().rows.length > 0 && <Pagination table={table} />}
        </>
      )}
    </div>
  )
}
