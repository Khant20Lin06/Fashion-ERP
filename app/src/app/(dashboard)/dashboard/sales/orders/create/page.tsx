import { SalesOrderForm } from "@/features/sales/components/SalesOrderForm"

export const metadata = {
  title: "New Sales Order · Fashion ERP/POS",
}

export default function CreateSalesOrderPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Sales Order</h1>
        <p className="text-sm text-muted-foreground">Create a sales order for a customer.</p>
      </div>

      <SalesOrderForm />
    </div>
  )
}
