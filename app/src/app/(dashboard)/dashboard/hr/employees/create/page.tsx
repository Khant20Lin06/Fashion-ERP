import { EmployeeForm } from "@/features/hr/components/EmployeeForm"

export const metadata = {
  title: "New Employee · Fashion ERP/POS",
}

export default function CreateEmployeePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Employee</h1>
        <p className="text-sm text-muted-foreground">Create a new employee record.</p>
      </div>

      <EmployeeForm />
    </div>
  )
}
