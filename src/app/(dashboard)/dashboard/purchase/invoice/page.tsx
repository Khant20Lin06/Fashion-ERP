import { PurchaseInvoiceTable } from "@/features/purchase/components/PurchaseInvoice"

export const metadata = {
  title: "Purchase Invoices · Fashion ERP/POS",
}

export default function PurchaseInvoicePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Purchase Invoice</h1>
        <p className="text-sm text-muted-foreground">Track supplier invoices and payment status.</p>
      </div>

      <PurchaseInvoiceTable />
    </div>
  )
}
