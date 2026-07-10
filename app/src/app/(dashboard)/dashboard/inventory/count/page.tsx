import { StockCountScreen } from "@/features/inventory/components/StockCountScreen"

export const metadata = {
  title: "Stock Count · Fashion ERP/POS",
}

export default function StockCountPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stock Count</h1>
        <p className="text-sm text-muted-foreground">
          Physical inventory counting with barcode scanning and difference calculation.
        </p>
      </div>

      <StockCountScreen />
    </div>
  )
}
