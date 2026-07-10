"use client"

import { useRef, useState } from "react"
import JsBarcode from "jsbarcode"
import { Download, Printer, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/format"
import { BarcodePreview } from "@/components/products/BarcodePreview"

type BarcodeGeneratorProps = {
  productName: string
  sku: string
  variantLabel?: string
  price: number
  barcode: string
  onBarcodeChange?: (value: string) => void
  onRegenerate?: () => void
}

/** Generates, previews, prints, and downloads a product/variant barcode label. */
export function BarcodeGenerator({
  productName,
  sku,
  variantLabel,
  price,
  barcode,
  onBarcodeChange,
  onRegenerate,
}: BarcodeGeneratorProps) {
  const labelRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=400,height=300")
    if (!printWindow || !labelRef.current) return
    printWindow.document.write(`
      <html>
        <head><title>Barcode Label — ${sku}</title></head>
        <body style="margin:0;padding:16px;font-family:sans-serif;">
          ${labelRef.current.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  function handleDownload() {
    if (!barcode) return
    setDownloading(true)
    const canvas = document.createElement("canvas")
    JsBarcode(canvas, barcode, { format: "CODE128", displayValue: true, fontSize: 13, margin: 8 })
    const link = document.createElement("a")
    link.download = `barcode-${sku}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
    setDownloading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Barcode</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="barcode-value">Barcode number</Label>
            <Input
              id="barcode-value"
              value={barcode}
              onChange={(e) => onBarcodeChange?.(e.target.value)}
              className="font-mono"
            />
          </div>
          {onRegenerate && (
            <Button type="button" variant="outline" size="icon" onClick={onRegenerate} aria-label="Regenerate barcode">
              <RefreshCw className="size-4" />
            </Button>
          )}
        </div>

        <div ref={labelRef} className="rounded-lg border bg-card p-4">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm font-semibold">{productName}</p>
            <p className="text-xs text-muted-foreground">
              {sku}
              {variantLabel ? ` · ${variantLabel}` : ""}
            </p>
            <BarcodePreview value={barcode} />
            <p className="text-sm font-semibold">{formatCurrency(price)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer /> Print
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={handleDownload} disabled={downloading}>
            <Download /> Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
