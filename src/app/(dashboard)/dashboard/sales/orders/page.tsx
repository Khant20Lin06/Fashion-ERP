import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SalesTable } from "@/features/sales/components/SalesTable"

export const metadata = {
  title: "Sales Orders · Fashion ERP/POS",
}

export default function SalesOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales Orders</h1>
          <p className="text-sm text-muted-foreground">Track and manage customer sales orders.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/sales/orders/create">
            <Plus /> New Sales Order
          </Link>
        </Button>
      </div>

      <SalesTable />
    </div>
  )
}
