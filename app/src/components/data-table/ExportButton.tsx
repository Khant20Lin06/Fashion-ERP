"use client"

import type { Table } from "@tanstack/react-table"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

type ExportButtonProps<TData> = {
  table: Table<TData>
  filename?: string
}

function toCsvValue(value: unknown): string {
  const stringValue = value == null ? "" : String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

/** Exports the table's current filtered rows (respecting active filters/search) as CSV. */
export function ExportButton<TData>({ table, filename = "export" }: ExportButtonProps<TData>) {
  function handleExport() {
    const visibleColumns = table.getVisibleLeafColumns().filter((col) => col.id !== "select" && col.id !== "actions")
    const rows = table.getFilteredRowModel().rows

    const header = visibleColumns.map((col) => toCsvValue(col.columnDef.header?.toString() ?? col.id))
    const body = rows.map((row) =>
      visibleColumns.map((col) => toCsvValue(row.getValue(col.id))).join(",")
    )

    const csvContent = [header.join(","), ...body].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="size-4" />
      Export CSV
    </Button>
  )
}
