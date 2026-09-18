import Link from "next/link"
import { FileSpreadsheet, Plus, Ruler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BatchPrintButton } from "@/features/products/components/BatchPrintButton"
import { ProductTable } from "@/features/products/components/ProductTable"

export const metadata = {
  title: "Product Management · Fashion ERP/POS",
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Product Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog, variants, pricing, and stock levels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BatchPrintButton />
          <Button asChild variant="outline">
            <Link href="/dashboard/products/uoms">
              <Ruler /> Manage UOM
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/products/price-lists">
              <FileSpreadsheet /> Price Lists
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/products/create">
              <Plus /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductTable />
    </div>
  )
}
