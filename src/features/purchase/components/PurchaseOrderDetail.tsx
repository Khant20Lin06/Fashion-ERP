import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchaseStatusBadge } from "@/components/purchase/PurchaseStatusBadge"
import { PurchaseItemTable } from "@/components/purchase/PurchaseItemTable"
import { PurchaseSummaryCard } from "@/components/purchase/PurchaseSummaryCard"
import type { PurchaseOrder } from "../types"

type PurchaseOrderDetailProps = {
  order: PurchaseOrder
}

function formatOptionalDate(value: string) {
  if (!value) return "-"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString()
}

export function PurchaseOrderDetail({ order }: PurchaseOrderDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{order.poNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {order.supplierName} · Ordered {formatOptionalDate(order.date)} · Delivery {formatOptionalDate(order.deliveryDate)}
          </p>
        </div>
        <PurchaseStatusBadge status={order.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supplier Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Supplier</p>
            <p className="text-sm">{order.supplierName || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Contact</p>
            <p className="text-sm">{order.contact || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Payment Terms</p>
            <p className="text-sm">{order.paymentTerms || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Items</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseItemTable items={order.items} />
        </CardContent>
      </Card>

      <div className="sm:max-w-xs sm:self-end">
        <PurchaseSummaryCard
          subtotal={order.subtotal}
          taxTotal={order.taxTotal}
          discountTotal={order.discountTotal}
          grandTotal={order.grandTotal}
        />
      </div>
    </div>
  )
}
