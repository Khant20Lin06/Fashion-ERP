"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil } from "lucide-react"
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
import { PromotionStatusBadge } from "@/components/promotions/PromotionStatusBadge"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { usePromotions } from "../hooks/usePromotions"
import { PromotionFormDialog } from "./PromotionForm"
import type { Promotion } from "../types"

function formatDiscount(promotion: Promotion): string {
  return promotion.discountType === "PERCENTAGE"
    ? formatPercent(Number(promotion.discountValue))
    : formatCurrency(Number(promotion.discountValue))
}

/** Promotion management table — the primary /dashboard/sales/discounts list view. */
export function PromotionTable() {
  const { data, isLoading, isError, refetch } = usePromotions()
  const [editing, setEditing] = useState<Promotion | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  function openEdit(promotion: Promotion) {
    setEditing(promotion)
    setFormOpen(true)
  }

  const filteredData = (data ?? []).filter((promotion) => {
    if (filters.status && promotion.status !== filters.status) return false
    return true
  })

  const columns: DataTableColumnDef<Promotion>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => <ColumnHeader column={column} title="Code" />,
      cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.getValue("code")}</span>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <ColumnHeader column={column} title="Name" />,
    },
    {
      id: "discount",
      header: "Discount",
      cell: ({ row }) => formatDiscount(row.original),
    },
    {
      accessorKey: "minimumPurchase",
      header: ({ column }) => <ColumnHeader column={column} title="Min. Purchase" />,
      cell: ({ row }) => formatCurrency(Number(row.getValue("minimumPurchase"))),
    },
    {
      id: "usage",
      header: "Usage",
      cell: ({ row }) => {
        const promotion = row.original
        return promotion.usageLimit
          ? `${formatNumber(promotion.usageCount)} / ${formatNumber(promotion.usageLimit)}`
          : `${formatNumber(promotion.usageCount)} (unlimited)`
      },
    },
    {
      id: "dates",
      header: "Dates",
      cell: ({ row }) => {
        const promotion = row.original
        const start = new Date(promotion.startDate).toLocaleDateString()
        const end = promotion.endDate ? new Date(promotion.endDate).toLocaleDateString() : "No end date"
        return (
          <span className="text-xs text-muted-foreground">
            {start} – {end}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <PromotionStatusBadge status={row.getValue("status")} />,
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
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              <Pencil /> Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        searchPlaceholder="Search promotions..."
        filterFields={[
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ],
          },
        ]}
        filterValues={filters}
        onFilterChange={setFilters}
        exportFilename="promotions"
        emptyTitle="No promotions"
        emptyDescription="Create a promotion to offer discounts at checkout."
      />

      <PromotionFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(undefined)
        }}
        promotion={editing}
      />
    </>
  )
}
