"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useAllProductsFull } from "../hooks/useProducts"
import type { ProductVariant, VariantStatus } from "../types"

type VariantRow = ProductVariant & { productName: string }

const statusVariant: Record<VariantStatus, "default" | "secondary"> = {
  active: "default",
  inactive: "secondary",
}

/** Cross-product variant overview — every SKU/barcode/attribute combination across the catalog. */
export function VariantTable() {
  const { data: products, isLoading, isError, refetch } = useAllProductsFull()
  const router = useRouter()

  const rows: VariantRow[] = useMemo(
    () => (products ?? []).flatMap((product) => product.variants.map((variant) => ({ ...variant, productName: product.name }))),
    [products]
  )

  const columns: DataTableColumnDef<VariantRow>[] = [
    {
      accessorKey: "productName",
      header: ({ column }) => <ColumnHeader column={column} title="Product" />,
      cell: ({ row }) => (
        <button
          className="text-left font-medium hover:underline"
          onClick={() => router.push(`/dashboard/products/${row.original.productId}`)}
        >
          {row.getValue("productName")}
        </button>
      ),
    },
    {
      accessorKey: "sku",
      header: ({ column }) => <ColumnHeader column={column} title="SKU" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("sku")}</span>,
    },
    {
      accessorKey: "barcode",
      header: ({ column }) => <ColumnHeader column={column} title="Barcode" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("barcode")}</span>,
    },
    {
      id: "attributes",
      header: "Attributes",
      cell: ({ row }) => {
        const attributes = row.original.attributes
        const entries = Object.entries(attributes).filter(([, value]) => value)
        if (entries.length === 0) return <span className="text-muted-foreground">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {entries.map(([kind, value]) => (
              <Badge key={kind} variant="outline" className="text-xs capitalize">
                {value}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: "sellingPrice",
      header: ({ column }) => <ColumnHeader column={column} title="Price" />,
      cell: ({ row }) => formatCurrency(row.getValue("sellingPrice")),
    },
    {
      accessorKey: "stockQuantity",
      header: ({ column }) => <ColumnHeader column={column} title="Stock" />,
      cell: ({ row }) => formatNumber(row.getValue("stockQuantity")),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue<VariantStatus>("status")
        return (
          <Badge variant={statusVariant[status]} className="capitalize">
            {status}
          </Badge>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      searchPlaceholder="Search variants..."
      exportFilename="variants"
      emptyTitle="No variants found"
      emptyDescription="Product variants will appear here once created."
    />
  )
}
