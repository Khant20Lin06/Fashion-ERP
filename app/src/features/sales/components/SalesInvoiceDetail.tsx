"use client"

import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InvoicePreview } from "@/components/sales/InvoicePreview"
import type { SalesInvoice } from "../types"

type SalesInvoiceDetailProps = {
  invoice: SalesInvoice
}

/** Sales Invoice detail page — printable preview with Print/Download actions. */
export function SalesInvoiceDetail({ invoice }: SalesInvoiceDetailProps) {
  function handlePrint() {
    window.print()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer /> Print Invoice
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Download /> Download PDF
        </Button>
      </div>

      <InvoicePreview invoice={invoice} />
    </div>
  )
}
