import { formatCurrency, formatNumber } from "@/lib/format"
import type { SalesInvoice } from "@/features/sales/types"

type InvoicePreviewProps = {
  invoice: SalesInvoice
}

/** Printable invoice layout — company info, customer, items, totals, payment info. */
export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  return (
    <div className="flex flex-col gap-6 rounded-lg border bg-card p-6 text-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold">Fashion ERP/POS</p>
          <p className="text-xs text-muted-foreground">123 Retail Avenue, Yangon, Myanmar</p>
          <p className="text-xs text-muted-foreground">contact@fashionerp.example</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-base font-semibold">{invoice.invoiceNumber}</p>
          <p className="text-xs text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-y py-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Billed To</p>
          <p className="font-medium">{invoice.customerName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground">Sales Person</p>
          <p className="font-medium">{invoice.salesPerson}</p>
        </div>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="pb-2 font-medium">Item</th>
            <th className="pb-2 font-medium">Qty</th>
            <th className="pb-2 font-medium">Price</th>
            <th className="pb-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b last:border-none">
              <td className="py-2">
                <p className="font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.sku}
                  {item.color || item.size ? ` · ${[item.color, item.size].filter(Boolean).join(" / ")}` : ""}
                </p>
              </td>
              <td className="py-2">{formatNumber(item.quantity)}</td>
              <td className="py-2">{formatCurrency(item.price)}</td>
              <td className="py-2 text-right font-medium">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto flex w-full max-w-xs flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Discount</span>
          <span>-{formatCurrency(invoice.discountTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatCurrency(invoice.taxTotal)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-1.5 text-base font-semibold">
          <span>Grand Total</span>
          <span>{formatCurrency(invoice.grandTotal)}</span>
        </div>
      </div>

      <div className="border-t pt-4 text-xs text-muted-foreground">
        <p>
          Payment Method: <span className="capitalize text-foreground">{invoice.paymentMethod.replace("_", " ")}</span>
        </p>
        <p>
          Amount Paid: <span className="text-foreground">{formatCurrency(invoice.amountPaid)}</span>
        </p>
      </div>
    </div>
  )
}
