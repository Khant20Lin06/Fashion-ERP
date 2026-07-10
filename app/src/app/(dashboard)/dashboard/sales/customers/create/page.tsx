import { CustomerForm } from "@/features/sales/components/CustomerForm"

export const metadata = {
  title: "New Customer · Fashion ERP/POS",
}

export default function CreateCustomerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Customer</h1>
        <p className="text-sm text-muted-foreground">Create a new customer profile.</p>
      </div>

      <CustomerForm />
    </div>
  )
}
