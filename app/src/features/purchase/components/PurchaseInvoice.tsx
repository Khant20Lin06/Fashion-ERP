"use client"

import { useMemo, useState } from "react"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
  type FilterValues,
} from "@/components/data-table"
import { PurchaseStatusBadge } from "@/components/purchase/PurchaseStatusBadge"
import { formatCurrency } from "@/lib/format"
import { useInvoices } from "../hooks/usePayments"
import type { PurchaseInvoice as PurchaseInvoiceType } from "../types"

const columns: DataTableColumnDef<PurchaseInvoiceType>[] = [
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => <ColumnHeader column={column} title="Invoice Number" />,
    cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.getValue("invoiceNumber")}</span>,
  },
  {
    accessorKey: "supplierName",
    header: ({ column }) => <ColumnHeader column={column} title="Supplier" />,
  },
  {
    accessorKey: "poNumber",
    header: ({ column }) => <ColumnHeader column={column} title="Purchase Order" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("poNumber")}</span>,
  },
  {
    accessorKey: "grandTotal",
    header: ({ column }) => <ColumnHeader column={column} title="Total" />,
    cell: ({ row }) => formatCurrency(row.getValue("grandTotal")),
  },
  {
    accessorKey: "amountPaid",
    header: ({ column }) => <ColumnHeader column={column} title="Paid" />,
    cell: ({ row }) => formatCurrency(row.getValue("amountPaid")),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => <ColumnHeader column={column} title="Due Date" />,
    cell: ({ row }) => new Date(row.getValue<string>("dueDate")).toLocaleDateString(),
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => <ColumnHeader column={column} title="Payment Status" />,
    cell: ({ row }) => <PurchaseStatusBadge status={row.getValue("paymentStatus")} />,
  },
]

/** Purchase Invoice list — invoice number, supplier, PO reference, totals, and payment status. */
export function PurchaseInvoiceTable() {
  const { data, isLoading, isError, refetch } = useInvoices()
  const [filters, setFilters] = useState<FilterValues>({})

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((invoice) => {
      if (filters.paymentStatus && invoice.paymentStatus !== filters.paymentStatus) return false
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
      searchPlaceholder="Search invoices..."
      filterFields={[
        {
          key: "paymentStatus",
          label: "Payment Status",
          options: [
            { label: "Paid", value: "paid" },
            { label: "Partial", value: "partial" },
            { label: "Unpaid", value: "unpaid" },
            { label: "Overdue", value: "overdue" },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={setFilters}
      exportFilename="purchase-invoices"
      emptyTitle="No invoices found"
      emptyDescription="Invoices will appear here once purchase orders are billed."
    />
  )
}
