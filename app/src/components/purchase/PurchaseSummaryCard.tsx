import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"

type PurchaseSummaryCardProps = {
  subtotal: number
  taxTotal: number
  discountTotal: number
  grandTotal: number
}

/** Order/invoice summary block — Subtotal, Tax, Discount, Grand Total. */
export function PurchaseSummaryCard({ subtotal, taxTotal, discountTotal, grandTotal }: PurchaseSummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatCurrency(taxTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Discount</span>
          <span>-{formatCurrency(discountTotal)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
          <span>Grand Total</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
