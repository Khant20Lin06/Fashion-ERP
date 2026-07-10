"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
  type FilterValues,
} from "@/components/data-table"
import { ReturnStatusBadge } from "@/components/sales/ReturnStatusBadge"
import { formatCurrency } from "@/lib/format"
import { useInvoices } from "../hooks/useInvoice"
import type { SalesInvoice } from "../types"

/** Sales Invoice list — the primary /sales/invoices view. */
export function SalesInvoiceTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useInvoices()
  const [filters, setFilters] = useState<FilterValues>({})

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((invoice) => {
      if (filters.paymentStatus && invoice.paymentStatus !== filters.paymentStatus) return false
      return true
    })
  }, [data, filters])

  const columns: DataTableColumnDef<SalesInvoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: ({ column }) => <ColumnHeader column={column} title="Invoice No" />,
      cell: ({ row }) => (
        <button
          className="font-mono text-left text-sm font-medium hover:underline"
          onClick={() => router.push(`/dashboard/sales/invoices/${row.original.id}`)}
        >
          {row.getValue("invoiceNumber")}
        </button>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => <ColumnHeader column={column} title="Date" />,
      cell: ({ row }) => new Date(row.getValue<string>("date")).toLocaleDateString(),
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => <ColumnHeader column={column} title="Customer" />,
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => row.original.items.length,
    },
    {
      accessorKey: "grandTotal",
      header: ({ column }) => <ColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => formatCurrency(row.getValue("grandTotal")),
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => <ColumnHeader column={column} title="Payment Status" />,
      cell: ({ row }) => <ReturnStatusBadge status={row.getValue("paymentStatus")} />,
    },
    {
      accessorKey: "salesPerson",
      header: ({ column }) => <ColumnHeader column={column} title="Sales Person" />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <span className="capitalize text-muted-foreground">{row.getValue<string>("status")}</span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Row actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/sales/invoices/${row.original.id}`)}>
              <Eye /> View Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

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
            { label: "Refunded", value: "refunded" },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={setFilters}
      exportFilename="sales-invoices"
      emptyTitle="No invoices found"
      emptyDescription="Invoices will appear here once sales are recorded."
    />
  )
}
