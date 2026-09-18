"use client"

import { useState } from "react"
import { Truck, Wallet, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchaseItemTable } from "@/components/purchase/PurchaseItemTable"
import { PurchaseSummaryCard } from "@/components/purchase/PurchaseSummaryCard"
import { formatCurrency } from "@/lib/format"
import { OnlineOrderStatusBadge } from "./OnlineOrderStatusBadge"
import { CodStatusBadge } from "./CodStatusBadge"
import { DispatchOrderDialog } from "./DispatchOrderDialog"
import { SettleCodDialog } from "./SettleCodDialog"
import { useUpdateOnlineOrderStatus } from "../hooks/useOnlineOrders"
import type { OnlineOrder, OnlineOrderStatus } from "../types"

type OnlineOrderDetailProps = {
  order: OnlineOrder
}

const nextStatus: Partial<Record<OnlineOrderStatus, OnlineOrderStatus>> = {
  PENDING_REVIEW: "CONFIRMED",
  CONFIRMED: "PACKED",
  PACKED: "ON_MY_WAY",
  ON_MY_WAY: "DELIVERED",
}

const nextStatusLabel: Partial<Record<OnlineOrderStatus, string>> = {
  PENDING_REVIEW: "Confirm Order",
  CONFIRMED: "Mark as Packed",
  PACKED: "Ship Order",
  ON_MY_WAY: "Mark Delivered",
}

export function OnlineOrderDetail({ order }: OnlineOrderDetailProps) {
  const { mutate: updateStatus, isPending } = useUpdateOnlineOrderStatus()
  const [dispatchOpen, setDispatchOpen] = useState(false)
  const [settleOpen, setSettleOpen] = useState(false)

  const upcoming = nextStatus[order.status]

  const handleNextAction = () => {
    if (order.status === "PACKED") {
      setDispatchOpen(true)
    } else if (upcoming) {
      updateStatus({ id: order.id, status: upcoming })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {order.sale?.saleNumber || order.sale?.orderNumber || "Online Order"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {order.customerName || (order.telegramUsername ? `@${order.telegramUsername.replace(/^@/, '')}` : "Customer")} · Ordered {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OnlineOrderStatusBadge status={order.status} />
          {order.codStatus && order.codStatus !== "NONE" && (
            <CodStatusBadge status={order.codStatus} />
          )}

          {order.codStatus === "PENDING" && (
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
              onClick={() => setSettleOpen(true)}
            >
              <Wallet className="mr-1.5 size-3.5" />
              Settle COD
            </Button>
          )}

          {upcoming && (
            <Button size="sm" onClick={handleNextAction} disabled={isPending}>
              {order.status === "PACKED" && <Truck className="mr-1.5 size-3.5" />}
              {nextStatusLabel[order.status]}
            </Button>
          )}

          {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus({ id: order.id, status: "CANCELLED" })}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Order & Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order & Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Source</p>
              <p className="text-sm font-medium">{order.source}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Customer Name</p>
              <p className="text-sm font-medium">{order.customerName || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Customer Phone</p>
              <p className="text-sm">{order.customerPhone || "-"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-muted-foreground">Delivery Address</p>
              <p className="text-sm">{order.deliveryAddress || "-"}</p>
            </div>
            {order.telegramUsername && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Telegram Username</p>
                <p className="text-sm">@{order.telegramUsername.replace(/^@/, '')}</p>
              </div>
            )}
            {order.telegramUserId && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Telegram User ID</p>
                <p className="text-sm font-mono">{order.telegramUserId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery & COD Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="size-4 text-primary" />
              Delivery & COD Tracking
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-primary"
              onClick={() => setDispatchOpen(true)}
            >
              {order.courierService ? "Edit Dispatch" : "Assign Courier"}
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Courier Service</p>
              <p className="text-sm font-medium">{order.courierService || "Not assigned yet"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Waybill / Tracking #</p>
              <p className="text-sm font-mono font-medium">
                {order.trackingNumber || "-"}
              </p>
            </div>
            {order.riderName && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Rider Name</p>
                <p className="text-sm">{order.riderName}</p>
              </div>
            )}
            {order.riderPhone && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Rider Phone</p>
                <p className="text-sm font-mono">{order.riderPhone}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground">COD Amount</p>
              <p className="text-sm font-mono font-semibold">
                {order.codAmount ? formatCurrency(parseFloat(order.codAmount)) : "MMK 0"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">COD Reconciliation</p>
              <div className="mt-1 flex items-center gap-2">
                <CodStatusBadge status={order.codStatus} />
                {order.codStatus === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs px-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    onClick={() => setSettleOpen(true)}
                  >
                    Settle
                  </Button>
                )}
              </div>
            </div>
            {order.settledAt && (
              <div className="sm:col-span-2 text-xs text-muted-foreground flex items-center gap-1.5 pt-1 border-t">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                COD settled on {new Date(order.settledAt).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Products</CardTitle>
        </CardHeader>
        <CardContent>
          {order.sale?.items && order.sale.items.length > 0 ? (
            <PurchaseItemTable
              items={order.sale.items.map((item: any) => {
                const qty = Number(item.quantity ?? 1)
                const unitCost = Number(item.price ?? item.unitPriceSnapshot ?? 0)
                const discount = Number(item.discount ?? item.discountSnapshot ?? 0)
                const tax = Number(item.tax ?? item.taxSnapshot ?? 0)
                const amount = Number(item.total ?? item.lineTotal ?? (qty * unitCost - discount + tax))

                // Extract color and size
                let color = item.color || item.colorSnapshot || null
                let size = item.size || item.sizeSnapshot || null

                // If not directly present, check productVariant attributes
                if ((!color || !size) && item.productVariant?.attributes) {
                  for (const attr of item.productVariant.attributes) {
                    const kind = String(attr.kind || '').toUpperCase()
                    if (kind === 'COLOR' && attr.option?.value) {
                      color = attr.option.value
                    } else if (kind === 'SIZE' && attr.option?.value) {
                      size = attr.option.value
                    }
                  }
                }

                // Fallback: parse color and size from SKU (e.g. PROD-BULK-002-GRE-XS)
                if (!color || !size) {
                  const sku = String(item.skuSnapshot || item.sku || '')
                  const parts = sku.split('-')
                  if (parts.length >= 2) {
                    const last = parts[parts.length - 1]
                    const secondLast = parts[parts.length - 2]
                    const knownSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'FREE']
                    if (!size && knownSizes.includes(last.toUpperCase())) {
                      size = last.toUpperCase()
                      if (!color && secondLast && secondLast.length <= 5) {
                        color = secondLast
                      }
                    }
                  }
                }

                return {
                  id: item.id,
                  productId: item.productId || item.productVariantId || item.id,
                  productName: item.productName || item.productNameSnapshot || "Product",
                  sku: item.sku || item.skuSnapshot || "-",
                  color: color || undefined,
                  size: size || undefined,
                  quantity: qty,
                  unitCost,
                  discount,
                  tax,
                  amount,
                }
              })}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No items found.</p>
          )}
        </CardContent>
      </Card>

      <div className="sm:max-w-xs sm:self-end">
        <PurchaseSummaryCard
          subtotal={Number(order.sale?.subtotal ?? 0)}
          taxTotal={Number((order.sale as any)?.taxAmount ?? order.sale?.taxTotal ?? 0)}
          discountTotal={Number((order.sale as any)?.discountAmount ?? order.sale?.discountTotal ?? 0)}
          grandTotal={Number(order.sale?.grandTotal ?? 0)}
        />
      </div>

      {/* Dialogs */}
      <DispatchOrderDialog
        order={order}
        open={dispatchOpen}
        onOpenChange={setDispatchOpen}
      />
      <SettleCodDialog
        order={order}
        open={settleOpen}
        onOpenChange={setSettleOpen}
      />
    </div>
  )
}
