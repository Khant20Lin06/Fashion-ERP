import Image from "next/image"
import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { ProductListItem } from "@/features/products/types"

type ProductCardProps = {
  product: ProductListItem
  onClick?: () => void
}

const statusVariant: Record<ProductListItem["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
}

/** Grid-view product card, an alternative to the DataTable row for catalog browsing. */
export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      className="cursor-pointer gap-3 overflow-hidden py-0 transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="relative aspect-square w-full bg-muted">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="size-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="flex flex-col gap-1.5 px-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-medium">{product.name}</p>
          <Badge variant={statusVariant[product.status]} className="shrink-0 capitalize">
            {product.status}
          </Badge>
        </div>
        <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{formatCurrency(product.sellingPrice)}</span>
          <span className="text-xs text-muted-foreground">{formatNumber(product.stockQuantity)} in stock</span>
        </div>
      </CardContent>
    </Card>
  )
}
