"use client"

import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { formatCurrency } from "@/lib/format"
import type { LedgerEntry } from "@/features/accounting/types"

const columns: DataTableColumnDef<LedgerEntry>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => <ColumnHeader column={column} title="Date" />,
    cell: ({ row }) => new Date(row.getValue<string>("date")).toLocaleDateString(),
  },
  {
    accessorKey: "reference",
    header: ({ column }) => <ColumnHeader column={column} title="Reference" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("reference")}</span>,
  },
  {
    accessorKey: "accountName",
    header: ({ column }) => <ColumnHeader column={column} title="Account" />,
  },
  {
    accessorKey: "debit",
    header: ({ column }) => <ColumnHeader column={column} title="Debit" />,
    cell: ({ row }) => {
      const debit = row.getValue<number>("debit")
      return debit > 0 ? formatCurrency(debit) : <span className="text-muted-foreground">—</span>
    },
  },
  {
    accessorKey: "credit",
    header: ({ column }) => <ColumnHeader column={column} title="Credit" />,
    cell: ({ row }) => {
      const credit = row.getValue<number>("credit")
      return credit > 0 ? formatCurrency(credit) : <span className="text-muted-foreground">—</span>
    },
  },
  {
    accessorKey: "balance",
    header: ({ column }) => <ColumnHeader column={column} title="Balance" />,
    cell: ({ row }) => formatCurrency(row.getValue("balance")),
  },
  {
    accessorKey: "user",
    header: ({ column }) => <ColumnHeader column={column} title="User" />,
  },
]

type LedgerTableProps = {
  data: LedgerEntry[] | undefined
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

/** General Ledger table — Date/Reference/Account/Debit/Credit/Balance/User, with search/filter/export/print built in via DataTable. */
export function LedgerTable({ data, isLoading, isError, onRetry }: LedgerTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      searchPlaceholder="Search ledger..."
      exportFilename="general-ledger"
      emptyTitle="No ledger entries"
      emptyDescription="Posted transactions will appear here."
    />
  )
}
