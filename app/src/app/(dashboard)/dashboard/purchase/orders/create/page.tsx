import { PurchaseOrderForm } from "@/features/purchase/components/PurchaseOrderForm"

export const metadata = {
  title: "New Purchase Order · Fashion ERP/POS",
}

export default function CreatePurchaseOrderPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Purchase Order</h1>
        <p className="text-sm text-muted-foreground">Create a purchase order for a supplier.</p>
      </div>

      <PurchaseOrderForm />
    </div>
  )
}
