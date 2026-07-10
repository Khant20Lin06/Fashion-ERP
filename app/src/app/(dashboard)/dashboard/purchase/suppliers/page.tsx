import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SupplierTable } from "@/features/purchase/components/SupplierTable"

export const metadata = {
  title: "Suppliers · Fashion ERP/POS",
}

export default function SuppliersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground">Manage supplier relationships, contacts, and balances.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/purchase/suppliers/create">
            <Plus /> Add Supplier
          </Link>
        </Button>
      </div>

      <SupplierTable />
    </div>
  )
}
