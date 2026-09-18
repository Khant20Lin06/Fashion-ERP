"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal, MessageCircle, Truck } from "lucide-react"
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
import { OnlineOrderStatusBadge } from "./OnlineOrderStatusBadge"
import { CodStatusBadge } from "./CodStatusBadge"
import { formatCurrency } from "@/lib/format"
import { useOnlineOrders } from "../hooks/useOnlineOrders"
import type { OnlineOrder } from "../types"

export function OnlineOrderTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useOnlineOrders()
  const [filters, setFilters] = useState<FilterValues>({})

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((order) => {
      if (filters.status && order.status !== filters.status) return false
      if (filters.source && order.source !== filters.source) return false
      if (filters.codStatus && order.codStatus !== filters.codStatus) return false
      return true
    })
  }, [data, filters])

  const columns: DataTableColumnDef<OnlineOrder>[] = [
    {
      accessorFn: (row) => row.sale?.saleNumber || row.sale?.orderNumber || "-",
      id: "orderNumber",
      header: ({ column }) => <ColumnHeader column={column} title="Order Number" />,
      cell: ({ row }) => (
        <button
          className="font-mono text-left text-sm font-medium hover:underline text-primary"
          onClick={() => router.push(`/dashboard/sales/online-orders/${row.original.id}`)}
        >
          {row.original.sale?.saleNumber || row.original.sale?.orderNumber || "-"}
        </button>
      ),
    },
    {
      accessorFn: (row) => row.customerName || (row.telegramUsername ? `@${row.telegramUsername.replace(/^@/, '')}` : "-"),
      id: "customer",
      header: ({ column }) => <ColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => {
        const name = row.original.customerName
        const rawUsername = row.original.telegramUsername
        const username = rawUsername ? (rawUsername.startsWith("@") ? rawUsername : `@${rawUsername}`) : null

        return (
          <div className="flex flex-col">
            <span className="font-medium">{name || username || "Customer"}</span>
            {name && username && (
              <span className="text-xs text-muted-foreground">{username}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "source",
      header: ({ column }) => <ColumnHeader column={column} title="Source" />,
      cell: ({ row }) => {
        const source = row.getValue<string>("source")
        return (
          <div className="flex items-center gap-1.5">
            {source === "TELEGRAM" && <MessageCircle className="h-4 w-4 text-blue-500" />}
            <span className="text-sm">{source}</span>
          </div>
        )
      },
    },
    {
      id: "delivery",
      header: ({ column }) => <ColumnHeader column={column} title="Courier & Tracking" />,
      cell: ({ row }) => {
        const courier = row.original.courierService
        const tracking = row.original.trackingNumber
        if (!courier && !tracking) {
          return <span className="text-xs text-muted-foreground">Unassigned</span>
        }
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium flex items-center gap-1">
              <Truck className="size-3 text-muted-foreground" />
              {courier || "Courier"}
            </span>
            {tracking && (
              <span className="font-mono text-muted-foreground">{tracking}</span>
            )}
          </div>
        )
      },
    },
    {
      id: "cod",
      header: ({ column }) => <ColumnHeader column={column} title="COD Status" />,
      cell: ({ row }) => {
        const status = row.original.codStatus
        const amount = row.original.codAmount
        return (
          <div className="flex flex-col gap-0.5">
            <CodStatusBadge status={status} />
            {amount && parseFloat(amount) > 0 && (
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {formatCurrency(parseFloat(amount))}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: "grandTotal",
      header: ({ column }) => <ColumnHeader column={column} title="Total Amount" />,
      cell: ({ row }) => formatCurrency(Number(row.original.sale?.grandTotal ?? 0)),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <ColumnHeader column={column} title="Order Date" />,
      cell: ({ row }) => new Date(row.getValue<string>("createdAt")).toLocaleDateString(),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <OnlineOrderStatusBadge status={row.getValue("status")} />,
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/sales/online-orders/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
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
      searchPlaceholder="Search online orders..."
      filterFields={[
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Pending Review", value: "PENDING_REVIEW" },
            { label: "Confirmed", value: "CONFIRMED" },
            { label: "Packed", value: "PACKED" },
            { label: "On My Way", value: "ON_MY_WAY" },
            { label: "Delivered", value: "DELIVERED" },
            { label: "Cancelled", value: "CANCELLED" },
          ],
        },
        {
          key: "codStatus",
          label: "COD Status",
          options: [
            { label: "COD Pending", value: "PENDING" },
            { label: "COD Settled", value: "SETTLED" },
            { label: "Prepaid / None", value: "NONE" },
            { label: "COD Failed", value: "FAILED" },
          ],
        },
        {
          key: "source",
          label: "Source",
          options: [
            { label: "Telegram", value: "TELEGRAM" },
            { label: "Website", value: "WEBSITE" },
            { label: "Facebook", value: "FACEBOOK" },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={setFilters}
      exportFilename="online-orders"
      emptyTitle="No online orders found"
      emptyDescription="Wait for customers to place orders online."
    />
  )
}
