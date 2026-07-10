import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PurchaseOrderTable } from "@/features/purchase/components/PurchaseOrderTable"

export const metadata = {
  title: "Purchase Orders · Fashion ERP/POS",
}

export default function PurchaseOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">Track and manage all purchase orders.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/purchase/orders/create">
            <Plus /> New Purchase Order
          </Link>
        </Button>
      </div>

      <PurchaseOrderTable />
    </div>
  )
}
