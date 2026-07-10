import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueTrendChart } from "@/features/sales/components/RevenueTrendChart"
import { ProductPerformanceTable } from "@/features/sales/components/ProductPerformanceTable"
import { CustomerAnalyticsSummaryCard } from "@/features/sales/components/CustomerAnalyticsSummaryCard"

export const metadata = {
  title: "Sales Reports · Fashion ERP/POS",
}

export default function SalesReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sales Reports</h1>
        <p className="text-sm text-muted-foreground">Revenue trend, product performance, and customer analytics.</p>
      </div>

      <RevenueTrendChart />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductPerformanceTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerAnalyticsSummaryCard />
        </CardContent>
      </Card>
    </div>
  )
}
