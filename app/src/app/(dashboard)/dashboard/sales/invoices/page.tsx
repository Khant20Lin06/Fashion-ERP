import { SalesInvoiceTable } from "@/features/sales/components/SalesInvoiceTable"

export const metadata = {
  title: "Sales Invoices · Fashion ERP/POS",
}

export default function SalesInvoicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sales Invoice</h1>
        <p className="text-sm text-muted-foreground">Track invoices, payment status, and sales history.</p>
      </div>

      <SalesInvoiceTable />
    </div>
  )
}
