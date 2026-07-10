import { DashboardBuilder } from "@/features/reports/components/DashboardBuilder"

export const metadata = {
  title: "My Dashboard · Fashion ERP/POS",
}

export default function ReportsHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your custom business intelligence dashboard — add, remove, and reorder widgets.
        </p>
      </div>

      <DashboardBuilder />
    </div>
  )
}
