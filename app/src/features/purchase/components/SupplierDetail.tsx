"use client"

import Link from "next/link"
import { Building2, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { PurchaseStatusBadge } from "@/components/purchase/PurchaseStatusBadge"
import { PurchaseItemTable } from "@/components/purchase/PurchaseItemTable"
import { PaymentTimeline } from "@/components/purchase/PaymentTimeline"
import { formatCurrency, formatPercent, formatRelativeTime } from "@/lib/format"
import { usePurchaseOrders } from "../hooks/usePurchaseOrders"
import { useInvoices, usePayments } from "../hooks/usePayments"
import { useSupplierPerformance } from "../hooks/useSuppliers"
import type { Supplier } from "../types"

type SupplierDetailProps = {
  supplier: Supplier
}

/** Supplier Profile page: header + Overview/Purchase History/Invoices/Payments/Products/Performance tabs. */
export function SupplierDetail({ supplier }: SupplierDetailProps) {
  const { data: orders } = usePurchaseOrders()
  const { data: invoices } = useInvoices()
  const { data: payments } = usePayments()
  const { data: performance, isLoading: loadingPerformance } = useSupplierPerformance(supplier.id)

  const supplierOrders = (orders ?? []).filter((o) => o.supplierId === supplier.id)
  const supplierInvoices = (invoices ?? []).filter((i) => i.supplierId === supplier.id)
  const supplierPayments = (payments ?? []).filter((p) => p.supplierId === supplier.id)
  const productsSupplied = Array.from(
    new Map(supplierOrders.flatMap((o) => o.items).map((item) => [item.sku, item])).values()
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border bg-muted">
            <Building2 className="size-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{supplier.name}</h1>
            <p className="font-mono text-sm text-muted-foreground">{supplier.code}</p>
            <Badge variant={supplier.status === "active" ? "default" : "outline"} className="capitalize">
              {supplier.status}
            </Badge>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/purchase/suppliers/${supplier.id}/edit`}>
            <Pencil /> Edit Supplier
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Purchase History</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="products">Products Supplied</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Contact Person" value={supplier.contactPerson} />
              <DetailField label="Phone" value={supplier.phone} />
              <DetailField label="Email" value={supplier.email} />
              <DetailField label="Website" value={supplier.website ?? "—"} />
              <DetailField label="Address" value={supplier.address} />
              <DetailField label="Country" value={supplier.country} />
              <DetailField label="Payment Terms" value={supplier.paymentTerms} />
              <DetailField label="Currency" value={supplier.currency} />
              <DetailField label="Total Purchase" value={formatCurrency(supplier.totalPurchase)} />
              <DetailField label="Outstanding" value={formatCurrency(supplier.outstanding)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Purchase History ({supplierOrders.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {supplierOrders.length === 0 ? (
                <EmptyState title="No purchase orders" description="No orders have been placed with this supplier yet." />
              ) : (
                supplierOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-mono font-medium">{order.poNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(order.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(order.grandTotal)}</span>
                      <PurchaseStatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoices ({supplierInvoices.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {supplierInvoices.length === 0 ? (
                <EmptyState title="No invoices" description="No invoices have been issued for this supplier yet." />
              ) : (
                supplierInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-mono font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">Due {formatRelativeTime(invoice.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(invoice.grandTotal)}</span>
                      <PurchaseStatusBadge status={invoice.paymentStatus} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentTimeline payments={supplierPayments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Products Supplied</CardTitle>
            </CardHeader>
            <CardContent>
              {productsSupplied.length === 0 ? (
                <EmptyState title="No products yet" description="Products purchased from this supplier will appear here." />
              ) : (
                <PurchaseItemTable items={productsSupplied} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {loadingPerformance ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : !performance ? (
                <EmptyState title="No performance data" description="Performance metrics will appear here once available." />
              ) : (
                <>
                  <DetailField label="Avg. Delivery Time" value={`${performance.avgDeliveryDays} days`} />
                  <DetailField label="Order Accuracy" value={formatPercent(performance.orderAccuracy)} />
                  <DetailField label="Quality Rating" value={`${performance.qualityRating.toFixed(1)} / 5`} />
                  <DetailField label="Purchase Volume" value={formatCurrency(performance.purchaseVolume)} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  )
}
