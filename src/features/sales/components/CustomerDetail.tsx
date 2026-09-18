"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageSquare, Pencil, Send, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { ReturnStatusBadge } from "@/components/sales/ReturnStatusBadge"
import { LoyaltyCard } from "@/components/sales/LoyaltyCard"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import {
  useCustomerAnalytics,
  useCustomerNotes,
  useCreateCustomerNote,
} from "../hooks/useCustomers"
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
  const { data: notes, isLoading: loadingNotes } = useCustomerNotes(customer.id)
  const createNoteMutation = useCreateCustomerNote(customer.id)
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteType, setNewNoteType] = useState("NOTE")

  const customerInvoices = (invoices ?? []).filter((i) => i.customerId === customer.id)
  const customerReturns = (returns ?? []).filter((r) => r.customerId === customer.id)

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteContent.trim()) return
    await createNoteMutation.mutateAsync({
      content: newNoteContent.trim(),
      noteType: newNoteType,
    })
    setNewNoteContent("")
  }

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
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {customer.loyaltyMember && (
                <Badge className="capitalize">{customer.memberLevel} Member</Badge>
              )}
              {analytics?.rfmSegment && (
                <Badge
                  variant="outline"
                  className={
                    analytics.rfmSegment === "VIP"
                      ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                      : analytics.rfmSegment === "Loyal"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : analytics.rfmSegment === "At-Risk"
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-300 text-muted-foreground"
                  }
                >
                  RFM: {analytics.rfmSegment}
                </Badge>
              )}
            </div>
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
          <TabsTrigger value="crm">CRM & Notes</TabsTrigger>
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
                      <p className="font-mono font-medium">{ret.returnNumber}</p>
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

        <TabsContent value="crm" className="mt-4">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Log Customer Interaction & Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNote} className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {["NOTE", "PREFERENCE", "VISIT", "COMPLAINT"].map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setNewNoteType(type)}
                        className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                          newNoteType === type
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background hover:bg-muted"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Write fitting remarks, preferred styles, special requests, or visit notes..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={createNoteMutation.isPending || !newNoteContent.trim()}
                      className="gap-2"
                    >
                      <Send className="size-4" />
                      {createNoteMutation.isPending ? "Saving..." : "Save Note"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Interaction Timeline ({notes?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingNotes ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full mb-3" />
                  ))
                ) : !notes || notes.length === 0 ? (
                  <EmptyState
                    title="No customer notes yet"
                    description="Record personal customer preferences, size remarks, or visit notes to build long-term relationships."
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {notes.map((n) => (
                      <div
                        key={n.id}
                        className="flex flex-col gap-2 rounded-lg border p-4 text-sm bg-card shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                n.noteType === "COMPLAINT"
                                  ? "border-destructive text-destructive"
                                  : n.noteType === "PREFERENCE"
                                  ? "border-purple-400 text-purple-600"
                                  : n.noteType === "VISIT"
                                  ? "border-blue-400 text-blue-600"
                                  : "border-muted-foreground"
                              }
                            >
                              {n.noteType}
                            </Badge>
                            <span className="font-medium text-foreground">
                              {n.user?.displayName || n.user?.firstName || "Staff"}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-muted-foreground">
                          {n.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
