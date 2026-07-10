"use client"

import { useMemo, useState } from "react"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
  type FilterValues,
} from "@/components/data-table"
import { TransactionStatus } from "@/components/accounting/TransactionStatus"
import { formatCurrency } from "@/lib/format"
import { useReceivables } from "../hooks/usePayments"
import type { ReceivableRow } from "../types"

const columns: DataTableColumnDef<ReceivableRow>[] = [
  {
    accessorKey: "customerName",
    header: ({ column }) => <ColumnHeader column={column} title="Customer" />,
  },
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => <ColumnHeader column={column} title="Invoice" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("invoiceNumber")}</span>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => <ColumnHeader column={column} title="Date" />,
    cell: ({ row }) => new Date(row.getValue<string>("date")).toLocaleDateString(),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <ColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "paid",
    header: ({ column }) => <ColumnHeader column={column} title="Paid" />,
    cell: ({ row }) => formatCurrency(row.getValue("paid")),
  },
  {
    accessorKey: "remaining",
    header: ({ column }) => <ColumnHeader column={column} title="Remaining" />,
    cell: ({ row }) => formatCurrency(row.getValue("remaining")),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => <ColumnHeader column={column} title="Due Date" />,
    cell: ({ row }) => new Date(row.getValue<string>("dueDate")).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <ColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <TransactionStatus status={row.getValue("status")} />,
  },
]

/** Customer Receivable table — invoice-level AR detail. */
export function ReceivableTable() {
  const { data, isLoading, isError, refetch } = useReceivables()
  const [filters, setFilters] = useState<FilterValues>({})

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((row) => {
      if (filters.status && row.status !== filters.status) return false
      return true
    })
  }, [data, filters])

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      searchPlaceholder="Search receivables..."
      filterFields={[
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Paid", value: "paid" },
            { label: "Partial", value: "partial" },
            { label: "Pending", value: "pending" },
            { label: "Overdue", value: "overdue" },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={setFilters}
      exportFilename="accounts-receivable"
      emptyTitle="No receivables"
      emptyDescription="Outstanding customer invoices will appear here."
    />
  )
}
