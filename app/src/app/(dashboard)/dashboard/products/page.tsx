import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
        <Button asChild>
          <Link href="/dashboard/products/create">
            <Plus /> Add Product
          </Link>
        </Button>
      </div>

      <ProductTable />
    </div>
  )
}
