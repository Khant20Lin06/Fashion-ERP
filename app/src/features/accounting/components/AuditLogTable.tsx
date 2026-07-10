"use client"

import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { useAuditEntries } from "../hooks/useLedger"
import type { AuditEntry } from "../types"

const columns: DataTableColumnDef<AuditEntry>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => <ColumnHeader column={column} title="Date" />,
    cell: ({ row }) => new Date(row.getValue<string>("date")).toLocaleString(),
  },
  {
    accessorKey: "user",
    header: ({ column }) => <ColumnHeader column={column} title="User" />,
  },
  {
    accessorKey: "action",
    header: ({ column }) => <ColumnHeader column={column} title="Action" />,
    cell: ({ row }) => <Badge variant="outline">{row.getValue("action")}</Badge>,
  },
  {
    accessorKey: "module",
    header: ({ column }) => <ColumnHeader column={column} title="Module" />,
  },
  {
    accessorKey: "reference",
    header: ({ column }) => <ColumnHeader column={column} title="Reference" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("reference")}</span>,
  },
  {
    accessorKey: "changes",
    header: ({ column }) => <ColumnHeader column={column} title="Changes" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("changes")}</span>,
  },
]

/** Audit Log table — every accounting action across Journal, Payments, Expenses, and more. */
export function AuditLogTable() {
  const { data, isLoading, isError, refetch } = useAuditEntries()

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      searchPlaceholder="Search audit log..."
      exportFilename="audit-log"
      emptyTitle="No audit activity"
      emptyDescription="Actions across the accounting module will appear here."
    />
  )
}
