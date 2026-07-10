"use client"

import Image from "next/image"
import Link from "next/link"
import { Package, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { PriceCard, MarginCard } from "@/components/products/PriceCard"
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/format"
import { StockSummary } from "./StockSummary"
import type { Product, ProductStatus } from "../types"

type ProductDetailProps = {
  product: Product
}

const statusVariant: Record<ProductStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
}

/** Product Detail page: header + Overview/Variants/Inventory/Pricing/History tabs. */
export function ProductDetail({ product }: ProductDetailProps) {
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {primaryImage ? (
              <Image src={primaryImage.url} alt={product.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="size-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{product.name}</h1>
            <p className="font-mono text-sm text-muted-foreground">{product.sku}</p>
            <Badge variant={statusVariant[product.status]} className="capitalize">
              {product.status}
            </Badge>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/products/${product.id}/edit`}>
            <Pencil /> Edit Product
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Category" value={product.categoryName} />
              <DetailField label="Brand" value={product.brandName} />
              <DetailField label="Collection" value={product.collectionName ?? "—"} />
              <DetailField label="Gender" value={product.gender} className="capitalize" />
              <DetailField label="Season" value={product.season.replace("_", "/")} className="capitalize" />
              <DetailField label="Total Stock" value={formatNumber(product.stockQuantity)} />
              {product.description && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Description</p>
                  <p className="mt-1 text-sm">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variants ({product.variants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {product.variants.length === 0 ? (
                <EmptyState title="No variants" description="This is a simple product with no variants." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                        <TableCell>{variant.attributes.color ?? "—"}</TableCell>
                        <TableCell>{variant.attributes.size ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{variant.barcode}</TableCell>
                        <TableCell>{formatCurrency(variant.sellingPrice)}</TableCell>
                        <TableCell>{formatNumber(variant.stockQuantity)}</TableCell>
                        <TableCell>
                          <Badge variant={variant.status === "active" ? "default" : "secondary"} className="capitalize">
                            {variant.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <StockSummary warehouseStock={product.warehouseStock} />
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PriceCard label="Cost Price" value={product.pricing.costPrice} tone="muted" />
            <PriceCard label="Selling Price" value={product.pricing.sellingPrice} />
            {product.pricing.discountPrice ? (
              <PriceCard label="Discount Price" value={product.pricing.discountPrice} tone="muted" />
            ) : null}
            {product.pricing.wholesalePrice ? (
              <PriceCard label="Wholesale Price" value={product.pricing.wholesalePrice} tone="muted" />
            ) : null}
            <MarginCard costPrice={product.pricing.costPrice} sellingPrice={product.pricing.sellingPrice} />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              {product.history.length === 0 ? (
                <EmptyState title="No history" description="No activity has been recorded for this product." />
              ) : (
                <ul className="flex flex-col gap-3">
                  {product.history.map((entry) => (
                    <li key={entry.id} className="flex items-start justify-between gap-4 border-b pb-3 last:border-none last:pb-0">
                      <div>
                        <p className="text-sm font-medium">{entry.action}</p>
                        <p className="text-sm text-muted-foreground">{entry.detail}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{entry.actor}</p>
                        <p>{formatRelativeTime(entry.timestamp)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DetailField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm ${className ?? ""}`}>{value}</p>
    </div>
  )
}
