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

// Known size tokens (uppercase) — order matters: longer tokens first
const SIZE_TOKENS = ["XXL", "XL", "XS", "XXS", "S", "M", "L", "2XL", "3XL", "4XL",
  "36", "38", "40", "42", "44", "46", "48", "50", "52", "54",
  "6", "7", "8", "9", "10", "11", "12",
  "ONE SIZE", "ONESIZE", "OS", "FREE"]

const COLOR_LABEL: Record<string, string> = {
  BLK: "Black", WHI: "White", WHT: "White", NVY: "Navy", RED: "Red",
  GRN: "Green", BEI: "Beige", GRY: "Grey", BLU: "Blue", PNK: "Pink",
  BRW: "Brown", ORG: "Orange", PRP: "Purple", YLW: "Yellow", GLD: "Gold",
  SLV: "Silver", BLK2: "Black", CRM: "Cream", TAN: "Tan", KHA: "Khaki",
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Extract { color, size } from a variant SKU like PROD-BULK-001-BLK-L */
function parseSkuAttrs(sku: string): { color?: string; size?: string } {
  const parts = sku.toUpperCase().split("-")
  // Try to find a size token
  let size: string | undefined
  let sizeIdx = -1
  for (let i = parts.length - 1; i >= 0; i--) {
    if (SIZE_TOKENS.includes(parts[i])) {
      size = parts[i]
      sizeIdx = i
      break
    }
  }
  // Color is the token just before size (or last non-numeric token)
  let color: string | undefined
  if (sizeIdx > 0) {
    const colorCode = parts[sizeIdx - 1]
    color = COLOR_LABEL[colorCode] ?? colorCode
  } else if (parts.length >= 2) {
    const last = parts[parts.length - 1]
    if (!SIZE_TOKENS.includes(last)) {
      color = COLOR_LABEL[last] ?? last
    }
  }
  return { color, size }
}

/** Normalise a variant's attributes — falls back to SKU parsing if backend sends empty [] */
function resolveAttrs(v: ProductVariant): { color?: string; size?: string } {
  const color = v.attributes?.color as string | undefined
  const size = v.attributes?.size as string | undefined
  const hasUsableColor = color && !UUID_PATTERN.test(color)
  const hasUsableSize = size && !UUID_PATTERN.test(size)
  if (hasUsableColor || hasUsableSize) {
    return {
      color: hasUsableColor ? color : undefined,
      size: hasUsableSize ? size : undefined,
    }
  }
  // Backend didn't populate attributes — parse from SKU
  return parseSkuAttrs(v.sku)
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

  // Enrich each variant with resolved color/size
  const enriched = useMemo(
    () => activeVariants.map((v) => ({ ...v, _attrs: resolveAttrs(v) })),
    [activeVariants]
  )

  // 1. Available colors: only those with stockQuantity > 0
  const colors = useMemo(() => {
    const cols = enriched
      .filter((v) => v.stockQuantity > 0)
      .map((v) => v._attrs.color)
      .filter(Boolean)
    return Array.from(new Set(cols)) as string[]
  }, [enriched])

  const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0])

  // 2. Available sizes: matching the selected color with stockQuantity > 0
  const sizes = useMemo(() => {
    const filtered = enriched.filter(
      (v) => v.stockQuantity > 0 && (!selectedColor || v._attrs.color === selectedColor)
    )
    const szs = filtered.map((v) => v._attrs.size).filter(Boolean)
    return Array.from(new Set(szs)) as string[]
  }, [enriched, selectedColor])

  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizes[0])

  // Helper to handle color selection & update size automatically to first valid choice
  const selectColor = (color: string) => {
    setSelectedColor(color)
    const matchingSizes = enriched
      .filter((v) => v.stockQuantity > 0 && v._attrs.color === color)
      .map((v) => v._attrs.size)
      .filter(Boolean)
    const uniqueSizes = Array.from(new Set(matchingSizes)) as string[]
    setSelectedSize(uniqueSizes[0])
  }

  const matchedEnriched = enriched.find(
    (v) =>
      (colors.length === 0 || v._attrs.color === selectedColor) &&
      (sizes.length === 0 || v._attrs.size === selectedSize)
  )
  const matchedVariant = matchedEnriched
    ? activeVariants.find((v) => v.id === matchedEnriched.id)
    : undefined

  // If no color/size could be parsed, fall back to a variant list
  const hasOptions = colors.length > 0 || sizes.length > 0

  const [qty, setQty] = useState(1)

  // For fallback: selected variant index when no color/size parsed
  const [selectedVariantId, setSelectedVariantId] = useState<string>(activeVariants[0]?.id ?? "")
  const fallbackVariant = activeVariants.find((v) => v.id === selectedVariantId) ?? activeVariants[0]
  const displayVariant = hasOptions ? matchedVariant : fallbackVariant
  const displayOutOfStock = !displayVariant || displayVariant.stockQuantity <= 0

  return (
    <>
      <DialogHeader>
        <DialogTitle>{product.name}</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        {/* ── Color pills ─────────────────────────── */}
        {colors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const swatch = swatchByColor.get(color)
                const cssColor = swatch ?? COLOR_LABEL_TO_CSS[color]
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => selectColor(color)}
                    aria-pressed={selectedColor === color}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selectedColor === color
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-transparent hover:bg-accent"
                    )}
                  >
                    {cssColor && (
                      <span
                        className="size-3 rounded-full border border-border/50"
                        style={{ backgroundColor: cssColor }}
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

        {/* ── Size pills ──────────────────────────── */}
        {sizes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                    className={cn(
                      "min-w-[2.5rem] rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-transparent hover:bg-accent"
                    )}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Fallback: variant dropdown when SKU has no color/size ── */}
        {!hasOptions && activeVariants.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Variant</p>
            <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
              {activeVariants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors text-left",
                    selectedVariantId === v.id
                      ? "border-primary bg-primary/10"
                      : "border-input bg-transparent hover:bg-accent",
                    v.stockQuantity <= 0 && "opacity-40 cursor-not-allowed"
                  )}
                  disabled={v.stockQuantity <= 0}
                >
                  <span className="font-mono text-xs text-muted-foreground mr-3">{v.sku}</span>
                  <span className="font-semibold">{formatCurrency(v.sellingPrice)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Stock & price summary ───────────────── */}
        <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {displayVariant
                ? `${displayVariant.stockQuantity} in stock`
                : "Not available"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {displayOutOfStock && (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
            {displayVariant && (
              <span className="text-base font-semibold">{formatCurrency(displayVariant.sellingPrice)}</span>
            )}
          </div>
        </div>

        {/* ── Quantity picker ─────────────────────── */}
        {!displayOutOfStock && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="size-8 rounded-full border border-input bg-transparent text-lg leading-none hover:bg-accent flex items-center justify-center transition-colors"
              >
                −
              </button>
              <span className="w-10 text-center text-base font-semibold tabular-nums">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(displayVariant!.stockQuantity, q + 1))}
                className="size-8 rounded-full border border-input bg-transparent text-lg leading-none hover:bg-accent flex items-center justify-center transition-colors"
              >
                +
              </button>
              {displayVariant && qty > 1 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  = {formatCurrency(displayVariant.sellingPrice * qty)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={displayOutOfStock}
          onClick={() => {
            if (displayVariant) {
              for (let i = 0; i < qty; i++) onConfirm(displayVariant)
            }
          }}
        >
          Add {qty > 1 ? `${qty}×` : ""} to Cart
        </Button>
      </DialogFooter>
    </>
  )
}

// CSS color lookup for labels without mock swatches
const COLOR_LABEL_TO_CSS: Record<string, string> = {
  Black: "#1a1a1a", White: "#ffffff", Navy: "#1e3a5f", Red: "#dc2626",
  Green: "#16a34a", Beige: "#d4b896", Grey: "#6b7280", Blue: "#2563eb",
  Pink: "#ec4899", Brown: "#92400e", Orange: "#ea580c", Purple: "#7c3aed",
  Yellow: "#ca8a04", Gold: "#b45309", Silver: "#9ca3af", Cream: "#fdf6e3",
  Tan: "#d2b48c", Khaki: "#c3b091",
}
