import { OnlineOrderTable } from "@/features/online-orders/components/OnlineOrderTable"

export const metadata = {
  title: "Online Orders · Fashion ERP/POS",
}

export default function OnlineOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Online Orders</h1>
          <p className="text-sm text-muted-foreground">Manage orders from Telegram, Website, and Facebook.</p>
        </div>
      </div>
      <OnlineOrderTable />
    </div>
  )
}
