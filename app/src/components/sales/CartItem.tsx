import Image from "next/image"
import { Package, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QuantityInput } from "@/components/inventory/QuantityInput"
import { formatCurrency } from "@/lib/format"
import type { CartItem as CartItemType } from "@/features/sales/types"

type CartItemProps = {
  item: CartItemType
  onQuantityChange: (quantity: number) => void
  onDiscountChange: (discountPercent: number) => void
  onRemove: () => void
}

/** A single POS cart line — image, name, variant, qty stepper, discount input, line total. */
export function CartItem({ item, onQuantityChange, onDiscountChange, onRemove }: CartItemProps) {
  const lineTotal = item.price * item.quantity * (1 - item.discountPercent / 100)

  return (
    <div className="flex items-start gap-3 border-b pb-3 last:border-none last:pb-0">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="size-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.productName}</p>
            {(item.color || item.size) && (
              <p className="text-xs text-muted-foreground">{[item.color, item.size].filter(Boolean).join(" / ")}</p>
            )}
          </div>
          <Button size="icon" variant="ghost" className="size-6 shrink-0" onClick={onRemove} aria-label="Remove item">
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <QuantityInput value={item.quantity} onChange={onQuantityChange} min={1} max={item.availableStock} />
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              max={100}
              value={item.discountPercent}
              onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
              className="w-14"
            />
            <span className="text-xs text-muted-foreground">% off</span>
          </div>
          <span className="ml-auto text-sm font-semibold">{formatCurrency(lineTotal)}</span>
        </div>
      </div>
    </div>
  )
}
