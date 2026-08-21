"use client"

import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { useAuditEntries } from "../hooks/useLedger"
import type { AuditEntry } from "../types"

const ENTITY_TYPE_LABEL: Record<AuditEntry["entityType"], string> = {
  JOURNAL_ENTRY: "Journal Entry",
  PAYMENT: "Payment",
  SALE: "Sale",
  PURCHASE_ORDER: "Purchase Order",
}

const columns: DataTableColumnDef<AuditEntry>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => <ColumnHeader column={column} title="Date" />,
    cell: ({ row }) => new Date(row.getValue<string>("timestamp")).toLocaleString(),
  },
  {
    accessorKey: "performedBy",
    header: ({ column }) => <ColumnHeader column={column} title="User" />,
    cell: ({ row }) => row.getValue("performedBy") ?? "—",
  },
  {
    accessorKey: "action",
    header: ({ column }) => <ColumnHeader column={column} title="Action" />,
    cell: ({ row }) => <Badge variant="outline">{row.getValue("action")}</Badge>,
  },
  {
    accessorKey: "entityType",
    header: ({ column }) => <ColumnHeader column={column} title="Module" />,
    cell: ({ row }) => ENTITY_TYPE_LABEL[row.getValue<AuditEntry["entityType"]>("entityType")],
  },
  {
    accessorKey: "referenceNumber",
    header: ({ column }) => <ColumnHeader column={column} title="Reference" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("referenceNumber")}</span>,
  },
]

/** Audit Log table — Journal Entry / Payment / Sale / Purchase Order activity (create/post/confirm), sourced from GET /reports/accounting/audit-log. */
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
      emptyDescription="Journal, payment, sale, and purchase order activity will appear here."
    />
  )
}
