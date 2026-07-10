import type { ColumnDef, RowSelectionState, SortingState, VisibilityState } from "@tanstack/react-table"

export type DataTableColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue>

export type DataTableState = {
  sorting: SortingState
  columnVisibility: VisibilityState
  rowSelection: RowSelectionState
  globalFilter: string
  pageIndex: number
  pageSize: number
}

export type BulkAction<TData> = {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onAction: (selectedRows: TData[]) => void
  variant?: "default" | "destructive"
}
