import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmployeeTable } from "@/features/hr/components/EmployeeTable"

export const metadata = {
  title: "Employees · Fashion ERP/POS",
}

export default function EmployeesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage employee records across the organization.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/hr/employees/create">
            <Plus /> Add Employee
          </Link>
        </Button>
      </div>

      <EmployeeTable />
    </div>
  )
}
