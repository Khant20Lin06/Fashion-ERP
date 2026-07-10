import { BarcodeScanner } from "@/features/inventory/components/BarcodeScanner"

export const metadata = {
  title: "Barcode Scanner · Fashion ERP/POS",
}

export default function BarcodeScannerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Barcode Scanner</h1>
        <p className="text-sm text-muted-foreground">Scan or enter a SKU/barcode for a quick stock check.</p>
      </div>

      <BarcodeScanner />
    </div>
  )
}
