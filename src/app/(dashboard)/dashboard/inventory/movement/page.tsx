import { StockMovementTable } from "@/features/inventory/components/StockMovementTable"

export const metadata = {
  title: "Stock Movement · Fashion ERP/POS",
}

export default function StockMovementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stock Movement</h1>
        <p className="text-sm text-muted-foreground">
          Full inventory ledger — every transaction that has affected stock.
        </p>
      </div>

      <StockMovementTable />
    </div>
  )
}
