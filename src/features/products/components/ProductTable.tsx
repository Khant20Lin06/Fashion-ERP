"use client"

import { useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Archive, MoreHorizontal, Package, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
  createSelectionColumn,
  type DataTableColumnDef,
} from "@/components/data-table"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useProducts } from "../hooks/useProducts"
import { useDeleteProduct } from "../hooks/useProductMutation"
import { useCategories } from "../hooks/useCategories"
import { useBrands } from "../hooks/useBrands"
import { useProductStore } from "../stores/product.store"
import type { ProductListItem, ProductStatus } from "../types"

const statusVariant: Record<ProductStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
}

const STOCK_LOW_THRESHOLD = 20

function stockBucket(quantity: number): "out" | "low" | "in" {
  if (quantity === 0) return "out"
  if (quantity <= STOCK_LOW_THRESHOLD) return "low"
  return "in"
}

const columns: DataTableColumnDef<ProductListItem>[] = [
  createSelectionColumn<ProductListItem>(),
  {
    id: "image",
    header: "Image",
    enableSorting: false,
    cell: ({ row }) => {
      const url = row.original.imageUrl
      return (
        <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
          {url ? (
            <Image src={url} alt={row.original.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="size-4 text-muted-foreground" />
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => <ColumnHeader column={column} title="Product Name" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "sku",
    header: ({ column }) => <ColumnHeader column={column} title="SKU" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("sku")}</span>,
  },
  {
    accessorKey: "categoryName",
    header: ({ column }) => <ColumnHeader column={column} title="Category" />,
  },
  {
    accessorKey: "brandName",
    header: ({ column }) => <ColumnHeader column={column} title="Brand" />,
  },
  {
    accessorKey: "variantCount",
    header: ({ column }) => <ColumnHeader column={column} title="Variants" />,
    cell: ({ row }) => {
      const count = row.getValue<number>("variantCount")
      return count > 0 ? <Badge variant="outline">{count}</Badge> : <span className="text-muted-foreground">—</span>
    },
  },
  {
    accessorKey: "stockQuantity",
    header: ({ column }) => <ColumnHeader column={column} title="Stock Quantity" />,
    cell: ({ row }) => {
      const qty = row.getValue<number>("stockQuantity")
      const bucket = stockBucket(qty)
      return (
        <span className={bucket === "out" ? "text-destructive" : bucket === "low" ? "text-warning" : ""}>
          {formatNumber(qty)}
        </span>
      )
    },
  },
  {
    accessorKey: "sellingPrice",
    header: ({ column }) => <ColumnHeader column={column} title="Selling Price" />,
    cell: ({ row }) => formatCurrency(row.getValue("sellingPrice")),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <ColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue<ProductStatus>("status")
      return (
        <Badge variant={statusVariant[status]} className="capitalize">
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <ColumnHeader column={column} title="Created Date" />,
    cell: ({ row }) => new Date(row.getValue<string>("createdAt")).toLocaleDateString(),
  },
]

/** Product Master DataTable — the primary /products list view. */
export function ProductTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useProducts()
  const { data: categories } = useCategories()
  const { data: brands } = useBrands()
  const { mutate: deleteProduct } = useDeleteProduct()
  const { filters, setFilter, resetFilters } = useProductStore()

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((product) => {
      if (filters.category && product.categoryName !== filters.category) return false
      if (filters.brand && product.brandName !== filters.brand) return false
      if (filters.status && product.status !== filters.status) return false
      if (filters.stock && stockBucket(product.stockQuantity) !== filters.stock) return false
      return true
    })
  }, [data, filters])

  const tableColumns = useMemo<DataTableColumnDef<ProductListItem>[]>(
    () => [
      ...columns,
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
              <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${row.original.id}`)}>
                <Pencil /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => deleteProduct(row.original.id)}>
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [router, deleteProduct]
  )

  return (
    <DataTable
      columns={tableColumns}
      data={filteredData}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      searchPlaceholder="Search products..."
      filterFields={[
        {
          key: "category",
          label: "Category",
          options: (categories ?? []).map((c) => ({ label: c.name, value: c.name })),
        },
        {
          key: "brand",
          label: "Brand",
          options: (brands ?? []).map((b) => ({ label: b.name, value: b.name })),
        },
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" },
            { label: "Archived", value: "archived" },
          ],
        },
        {
          key: "stock",
          label: "Stock",
          options: [
            { label: "In Stock", value: "in" },
            { label: "Low Stock", value: "low" },
            { label: "Out of Stock", value: "out" },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={(values) => {
        resetFilters()
        for (const [key, value] of Object.entries(values)) {
          setFilter(key as keyof typeof filters, value)
        }
      }}
      enableRowSelection
      bulkActions={[
        { label: "Archive", icon: Archive, onAction: () => {} },
        {
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          onAction: (rows) => rows.forEach((row) => deleteProduct(row.id)),
        },
      ]}
      exportFilename="products"
      emptyTitle="No products found"
      emptyDescription="Create your first product to get started."
    />
  )
}
