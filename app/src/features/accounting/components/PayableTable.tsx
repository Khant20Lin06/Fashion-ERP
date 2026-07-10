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
import { usePayables } from "../hooks/usePayments"
import type { PayableRow } from "../types"

const columns: DataTableColumnDef<PayableRow>[] = [
  {
    accessorKey: "supplierName",
    header: ({ column }) => <ColumnHeader column={column} title="Supplier" />,
  },
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => <ColumnHeader column={column} title="Invoice" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("invoiceNumber")}</span>,
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
    accessorKey: "balance",
    header: ({ column }) => <ColumnHeader column={column} title="Balance" />,
    cell: ({ row }) => formatCurrency(row.getValue("balance")),
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

/** Supplier Payment table — invoice-level AP detail. */
export function PayableTable() {
  const { data, isLoading, isError, refetch } = usePayables()
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
      searchPlaceholder="Search payables..."
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
      exportFilename="accounts-payable"
      emptyTitle="No payables"
      emptyDescription="Outstanding supplier invoices will appear here."
    />
  )
}
