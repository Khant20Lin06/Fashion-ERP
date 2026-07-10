import { SupplierForm } from "@/features/purchase/components/SupplierForm"

export const metadata = {
  title: "New Supplier · Fashion ERP/POS",
}

export default function CreateSupplierPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Supplier</h1>
        <p className="text-sm text-muted-foreground">Create a new supplier record.</p>
      </div>

      <SupplierForm />
    </div>
  )
}
