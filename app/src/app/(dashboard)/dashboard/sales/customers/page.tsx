import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomerTable } from "@/features/sales/components/CustomerTable"

export const metadata = {
  title: "Customers · Fashion ERP/POS",
}

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage customer profiles, loyalty, and purchase history.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/sales/customers/create">
            <Plus /> Add Customer
          </Link>
        </Button>
      </div>

      <CustomerTable />
    </div>
  )
}
