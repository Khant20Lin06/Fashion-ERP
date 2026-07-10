"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchaseItemTable } from "@/components/purchase/PurchaseItemTable"
import { PurchaseSummaryCard } from "@/components/purchase/PurchaseSummaryCard"
import { ReturnStatusBadge } from "@/components/sales/ReturnStatusBadge"
import { useUpdateSalesOrderStatus } from "../hooks/useSales"
import type { SalesOrder, SalesOrderStatus } from "../types"

type SalesOrderDetailProps = {
  order: SalesOrder
}

const nextStatus: Partial<Record<SalesOrderStatus, SalesOrderStatus>> = {
  draft: "confirmed",
  confirmed: "processing",
  processing: "delivered",
  delivered: "completed",
}

const nextStatusLabel: Partial<Record<SalesOrderStatus, string>> = {
  draft: "Confirm Order",
  confirmed: "Start Processing",
  processing: "Mark Delivered",
  delivered: "Mark Completed",
}

/** Sales Order detail — customer, line items, totals, and workflow status progression. */
export function SalesOrderDetail({ order }: SalesOrderDetailProps) {
  const { mutate: updateStatus, isPending } = useUpdateSalesOrderStatus()
  const upcoming = nextStatus[order.status]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {order.customerName} · Delivery {new Date(order.deliveryDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ReturnStatusBadge status={order.status} />
          {upcoming && (
            <Button size="sm" onClick={() => updateStatus({ id: order.id, status: upcoming })} disabled={isPending}>
              {nextStatusLabel[order.status]}
            </Button>
          )}
          {order.status !== "cancelled" && order.status !== "completed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus({ id: order.id, status: "cancelled" })}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Payment Terms</p>
            <p className="text-sm">{order.paymentTerms}</p>
          </div>
          {order.notes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Notes</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Products</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseItemTable
            items={order.items.map((item) => ({
              id: item.id,
              productId: item.productId,
              productName: item.productName,
              sku: item.sku,
              color: item.color,
              size: item.size,
              quantity: item.quantity,
              unitCost: item.price,
              discount: item.discount,
              tax: item.tax,
              amount: item.total,
            }))}
          />
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
