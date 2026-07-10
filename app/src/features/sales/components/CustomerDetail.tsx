"use client"

import Link from "next/link"
import { Pencil, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ReturnStatusBadge } from "@/components/sales/ReturnStatusBadge"
import { LoyaltyCard } from "@/components/sales/LoyaltyCard"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useCustomerAnalytics } from "../hooks/useCustomers"
import { useInvoices } from "../hooks/useInvoice"
import { useSalesReturns } from "../hooks/useInvoice"
import { useLoyaltyTransactions } from "../hooks/useInvoice"
import type { Customer } from "../types"

type CustomerDetailProps = {
  customer: Customer
}

/** Customer Profile page: header + Overview/Purchase History/Returns/Payments/Loyalty/Preferences tabs. */
export function CustomerDetail({ customer }: CustomerDetailProps) {
  const { data: analytics, isLoading: loadingAnalytics } = useCustomerAnalytics(customer.id)
  const { data: invoices } = useInvoices()
  const { data: returns } = useSalesReturns()
  const { data: loyaltyTransactions } = useLoyaltyTransactions(customer.id)

  const customerInvoices = (invoices ?? []).filter((i) => i.customerId === customer.id)
  const customerReturns = (returns ?? []).filter((r) => r.customerId === customer.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full border bg-muted">
            <User className="size-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
            {customer.loyaltyMember && (
              <Badge className="capitalize">{customer.memberLevel} Member</Badge>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/sales/customers/${customer.id}/edit`}>
            <Pencil /> Edit Customer
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Purchase History</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Points</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Analytics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loadingAnalytics ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : !analytics ? (
                <EmptyState title="No analytics yet" description="Analytics will appear after the first purchase." />
              ) : (
                <>
                  <DetailField label="Total Purchase" value={formatCurrency(analytics.totalPurchase)} />
                  <DetailField label="Average Order Value" value={formatCurrency(analytics.averageOrderValue)} />
                  <DetailField label="Last Purchase Date" value={formatRelativeTime(analytics.lastPurchaseDate)} />
                  <DetailField label="Favorite Categories" value={analytics.favoriteCategories.join(", ") || "—"} />
                  <DetailField label="Favorite Brands" value={analytics.favoriteBrands.join(", ") || "—"} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Purchase History ({customerInvoices.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {customerInvoices.length === 0 ? (
                <EmptyState title="No purchases yet" description="This customer hasn't made any purchases." />
              ) : (
                customerInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-mono font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(invoice.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(invoice.grandTotal)}</span>
                      <ReturnStatusBadge status={invoice.paymentStatus} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Returns ({customerReturns.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {customerReturns.length === 0 ? (
                <EmptyState title="No returns" description="This customer has no return requests." />
              ) : (
                customerReturns.map((ret) => (
                  <div key={ret.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-mono font-medium">{ret.reference}</p>
                      <p className="text-xs text-muted-foreground">{ret.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(ret.refundAmount)}</span>
                      <ReturnStatusBadge status={ret.status} />
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
              <CardTitle className="text-base">Payments</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {customerInvoices.filter((i) => i.amountPaid > 0).length === 0 ? (
                <EmptyState title="No payments" description="Payment history will appear here." />
              ) : (
                customerInvoices
                  .filter((i) => i.amountPaid > 0)
                  .map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                      <div>
                        <p className="font-mono font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-xs capitalize text-muted-foreground">{invoice.paymentMethod.replace("_", " ")}</p>
                      </div>
                      <span className="font-medium">{formatCurrency(invoice.amountPaid)}</span>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="mt-4">
          <div className="flex flex-col gap-4">
            <LoyaltyCard points={customer.loyaltyPoints} memberLevel={customer.memberLevel} />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Points History</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {!loyaltyTransactions || loyaltyTransactions.length === 0 ? (
                  <EmptyState title="No point activity" description="Earned and redeemed points will appear here." />
                ) : (
                  loyaltyTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {tx.reference} · {formatRelativeTime(tx.date)}
                      </span>
                      <span className={tx.type === "earn" ? "text-success" : "text-destructive"}>
                        {tx.points > 0 ? "+" : ""}
                        {tx.points} pts
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Customer Group" value={customer.customerGroup} />
              <DetailField label="Preferred Size" value={customer.preferredSize ?? "—"} />
              <DetailField label="Preferred Brand" value={customer.preferredBrand ?? "—"} />
              <DetailField label="Country / City" value={`${customer.country} / ${customer.city}`} />
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
