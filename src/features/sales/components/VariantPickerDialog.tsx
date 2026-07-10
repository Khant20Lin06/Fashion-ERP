"use client"

import { useMemo, useState } from "react"
import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { attributeOptions } from "@/features/products/api/mock-data"
import type { Product, ProductVariant } from "@/features/products/types"

type VariantPickerDialogProps = {
  product: Product | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (variant: ProductVariant) => void
}

const swatchByColor = new Map(
  attributeOptions.filter((option) => option.kind === "color").map((option) => [option.value, option.swatch])
)

/** Color/size picker shown before adding a multi-variant product to the POS cart. */
export function VariantPickerDialog({ product, open, onOpenChange, onConfirm }: VariantPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && product && (
          <VariantPickerDialogContent product={product} onOpenChange={onOpenChange} onConfirm={onConfirm} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function VariantPickerDialogContent({
  product,
  onOpenChange,
  onConfirm,
}: {
  product: Product
  onOpenChange: (open: boolean) => void
  onConfirm: (variant: ProductVariant) => void
}) {
  const activeVariants = useMemo(() => product.variants.filter((v) => v.status === "active"), [product])

  const colors = useMemo(
    () => Array.from(new Set(activeVariants.map((v) => v.attributes.color).filter(Boolean))) as string[],
    [activeVariants]
  )
  const sizes = useMemo(
    () => Array.from(new Set(activeVariants.map((v) => v.attributes.size).filter(Boolean))) as string[],
    [activeVariants]
  )

  const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0])
  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizes[0])

  const matchedVariant = activeVariants.find(
    (v) =>
      (colors.length === 0 || v.attributes.color === selectedColor) &&
      (sizes.length === 0 || v.attributes.size === selectedSize)
  )

  function isColorAvailable(color: string) {
    return activeVariants.some((v) => v.attributes.color === color && (sizes.length === 0 || v.attributes.size === selectedSize) && v.stockQuantity > 0)
  }

  function isSizeAvailable(size: string) {
    return activeVariants.some((v) => v.attributes.size === size && (colors.length === 0 || v.attributes.color === selectedColor) && v.stockQuantity > 0)
  }

  const isOutOfStock = !matchedVariant || matchedVariant.stockQuantity <= 0

  return (
    <>
      <DialogHeader>
        <DialogTitle>{product.name}</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        {colors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const available = isColorAvailable(color)
                const swatch = swatchByColor.get(color)
                return (
                  <button
                    key={color}
                    type="button"
                    disabled={!available}
                    onClick={() => setSelectedColor(color)}
                    aria-pressed={selectedColor === color}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selectedColor === color
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-transparent hover:bg-accent",
                      !available && "cursor-not-allowed opacity-40"
                    )}
                  >
                    {swatch && (
                      <span
                        className="size-3 rounded-full border border-border/50"
                        style={{ backgroundColor: swatch }}
                        aria-hidden
                      />
                    )}
                    {color}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const available = isSizeAvailable(size)
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!available}
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-transparent hover:bg-accent",
                      !available && "cursor-not-allowed opacity-40"
                    )}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {matchedVariant ? `${matchedVariant.stockQuantity} in stock` : "Not available"}
            </span>
          </div>
          {matchedVariant && (
            <span className="text-base font-semibold">{formatCurrency(matchedVariant.sellingPrice)}</span>
          )}
          {isOutOfStock && (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={isOutOfStock}
          onClick={() => {
            if (matchedVariant) onConfirm(matchedVariant)
          }}
        >
          Add to Cart
        </Button>
      </DialogFooter>
    </>
  )
}
