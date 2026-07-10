import { OrganizationTree } from "@/components/hr/OrganizationTree"

export const metadata = {
  title: "Organization · Fashion ERP/POS",
}

export default function OrganizationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Organization</h1>
        <p className="text-sm text-muted-foreground">Company structure across offices, departments, stores, and warehouses.</p>
      </div>

      <OrganizationTree />
    </div>
  )
}
