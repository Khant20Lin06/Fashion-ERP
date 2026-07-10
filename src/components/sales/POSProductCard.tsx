import Image from "next/image"
import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

type POSProductCardProps = {
  imageUrl?: string
  name: string
  variantLabel?: string
  price: number
  stockAvailable: number
  onClick: () => void
}

/** Tappable product card for the POS product grid — image, name, variant, price, stock. */
export function POSProductCard({ imageUrl, name, variantLabel, price, stockAvailable, onClick }: POSProductCardProps) {
  const isOutOfStock = stockAvailable <= 0

  return (
    <Card
      className={cn(
        "cursor-pointer gap-2 overflow-hidden py-0 transition-shadow hover:shadow-md",
        isOutOfStock && "cursor-not-allowed opacity-50"
      )}
      onClick={isOutOfStock ? undefined : onClick}
    >
      <div className="relative aspect-square w-full bg-muted">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="size-8 text-muted-foreground" />
          </div>
        )}
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute right-1.5 top-1.5">
            Out of Stock
          </Badge>
        )}
      </div>
      <CardContent className="flex flex-col gap-1 px-3 pb-3">
        <p className="line-clamp-1 text-sm font-medium">{name}</p>
        {variantLabel && <p className="text-xs text-muted-foreground">{variantLabel}</p>}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{formatCurrency(price)}</span>
          <span className="text-xs text-muted-foreground">{stockAvailable} left</span>
        </div>
      </CardContent>
    </Card>
  )
}
