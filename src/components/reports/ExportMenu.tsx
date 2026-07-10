"use client"

import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ExportFormat } from "@/features/reports/types"

function toCsvValue(value: unknown): string {
  const stringValue = value == null ? "" : String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const body = rows.map((row) => headers.map((h) => toCsvValue(row[h])).join(","))
  return [headers.join(","), ...body].join("\n")
}

function downloadBlob(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

type ExportMenuProps<T extends Record<string, unknown>> = {
  data: T[]
  filename?: string
}

/**
 * Export menu supporting CSV, Excel (CSV opened by Excel), PDF (browser print-to-PDF),
 * and Print — applied to the report's current (already-filtered) row data.
 */
export function ExportMenu<T extends Record<string, unknown>>({ data, filename = "report" }: ExportMenuProps<T>) {
  function handleExport(format: ExportFormat) {
    if (format === "csv") {
      downloadBlob(toCsv(data), "text/csv;charset=utf-8;", `${filename}.csv`)
      return
    }
    if (format === "excel") {
      downloadBlob(toCsv(data), "application/vnd.ms-excel;charset=utf-8;", `${filename}.xls`)
      return
    }
    // PDF and Print both use the browser's native print-to-PDF — no extra dependency needed.
    window.print()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="size-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText /> Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet /> Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText /> Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("print")}>
          <Printer /> Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
