import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/format"

type PriceCardProps = {
  label: string
  value: number
  tone?: "default" | "success" | "muted"
  helper?: string
}

const toneClass: Record<NonNullable<PriceCardProps["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  muted: "text-muted-foreground",
}

/** Compact single-figure price display used in pricing summaries. */
export function PriceCard({ label, value, tone = "default", helper }: PriceCardProps) {
  return (
    <Card className="gap-1 py-4">
      <CardContent className="flex flex-col gap-1 px-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={`text-xl font-semibold tabular-nums ${toneClass[tone]}`}>{formatCurrency(value)}</p>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  )
}

type MarginCardProps = {
  costPrice: number
  sellingPrice: number
}

/** Derived profit-margin card — profit = selling price - cost price. */
export function MarginCard({ costPrice, sellingPrice }: MarginCardProps) {
  const profit = sellingPrice - costPrice
  const marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0
  const tone = profit > 0 ? "success" : profit < 0 ? "destructive" : "muted"

  return (
    <Card className="gap-1 py-4">
      <CardContent className="flex flex-col gap-1 px-4">
        <p className="text-xs font-medium text-muted-foreground">Profit Margin</p>
        <p
          className={`text-xl font-semibold tabular-nums ${
            tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {formatCurrency(profit)}
        </p>
        <p className="text-xs text-muted-foreground">{formatPercent(marginPercent)} margin</p>
      </CardContent>
    </Card>
  )
}
