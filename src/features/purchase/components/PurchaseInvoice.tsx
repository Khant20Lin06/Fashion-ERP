"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
  type FilterValues,
} from "@/components/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PurchaseStatusBadge } from "@/components/purchase/PurchaseStatusBadge"
import { formatCurrency, formatPercent } from "@/lib/format"
import { useGoodsReceipts } from "../hooks/useGoodsReceipt"
import { useInvoices, usePurchaseReturns } from "../hooks/usePayments"
import { usePurchaseOrders } from "../hooks/usePurchaseOrders"
import { buildInvoiceWorkflowSnapshots, type InvoiceWorkflowSnapshot } from "../lib/workflow"

function PaymentReadinessBadge({ invoice }: { invoice: InvoiceWorkflowSnapshot }) {
  if (invoice.paymentReadiness === "ready") {
    return <Badge>Ready</Badge>
  }

  if (invoice.paymentReadiness === "fully_paid") {
    return <Badge variant="secondary">Settled</Badge>
  }

  return <Badge variant="outline">{invoice.paymentReadinessLabel}</Badge>
}

const columns: DataTableColumnDef<InvoiceWorkflowSnapshot>[] = [
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => <ColumnHeader column={column} title="Invoice Number" />,
    cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.getValue("invoiceNumber")}</span>,
  },
  {
    accessorKey: "supplierName",
    header: ({ column }) => <ColumnHeader column={column} title="Supplier" />,
  },
  {
    accessorKey: "poNumber",
    header: ({ column }) => <ColumnHeader column={column} title="Purchase Order" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("poNumber")}</span>,
  },
  {
    accessorKey: "orderStatus",
    header: ({ column }) => <ColumnHeader column={column} title="PO Status" />,
    cell: ({ row }) =>
      row.original.orderStatus === "missing_order" ? (
        <Badge variant="outline">Missing PO</Badge>
      ) : (
        <PurchaseStatusBadge status={row.original.orderStatus} />
      ),
  },
  {
    accessorKey: "receiptCoveragePercent",
    header: ({ column }) => <ColumnHeader column={column} title="Receipt Match" />,
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="text-sm font-medium">{formatPercent(row.original.receiptCoveragePercent)}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.receivedQuantity}/{row.original.orderedQuantity || 0} units received
        </p>
      </div>
    ),
  },
  {
    accessorKey: "balanceAmount",
    header: ({ column }) => <ColumnHeader column={column} title="Balance" />,
    cell: ({ row }) => formatCurrency(row.getValue("balanceAmount")),
  },
  {
    accessorKey: "supplierCreditAmount",
    header: ({ column }) => <ColumnHeader column={column} title="Supplier Credit" />,
    cell: ({ row }) => formatCurrency(row.original.supplierCreditAmount),
  },
  {
    accessorKey: "paymentReadiness",
    header: ({ column }) => <ColumnHeader column={column} title="Payment Readiness" />,
    cell: ({ row }) => (
      <div className="space-y-1">
        <PaymentReadinessBadge invoice={row.original} />
        {row.original.paymentBlockedReason ? (
          <p className="max-w-48 text-xs text-muted-foreground">{row.original.paymentBlockedReason}</p>
        ) : null}
      </div>
    ),
  },
]

function InvoiceOverviewList({
  invoices,
  isLoading,
  isError,
  onRetry,
}: {
  invoices: InvoiceWorkflowSnapshot[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}) {
  const openInvoices = invoices.filter((invoice) => invoice.balanceAmount > 0)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorState message="Couldn't load purchase invoices." onRetry={onRetry} />
  }

  if (openInvoices.length === 0) {
    return (
      <EmptyState
        title="No open supplier invoices"
        description="Posted supplier invoices with outstanding balance will appear here."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {openInvoices.map((invoice) => (
        <Card key={invoice.id}>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-sm font-medium">{invoice.invoiceNumber}</p>
                <PaymentReadinessBadge invoice={invoice} />
                {invoice.paymentStatus === "overdue" ? <Badge variant="outline">Overdue</Badge> : null}
              </div>
              <p className="text-sm">
                {invoice.supplierName} | {invoice.poNumber}
              </p>
              <p className="text-xs text-muted-foreground">
                Due {new Date(invoice.dueDate).toLocaleDateString()} | Receipt match{" "}
                {formatPercent(invoice.receiptCoveragePercent)} | {invoice.receivedQuantity}/
                {invoice.orderedQuantity || 0} units received
              </p>
              {invoice.paymentBlockedReason ? (
                <p className="text-xs text-muted-foreground">{invoice.paymentBlockedReason}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Receipt-matched invoices with outstanding balance are ready for supplier payment.
                </p>
              )}
            </div>

            <div className="flex min-w-[160px] flex-col gap-1 text-left sm:text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Outstanding Balance</p>
              <p className="text-lg font-semibold">{formatCurrency(invoice.balanceAmount)}</p>
              <p className="text-xs text-muted-foreground">
                Supplier credit: {formatCurrency(invoice.supplierCreditAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Purchase Invoice workspace - overview cards plus full invoice table, aligned to the request-page layout. */
export function PurchaseInvoiceTable() {
  const { data: invoices, isLoading, isError, refetch } = useInvoices()
  const { data: purchaseOrders } = usePurchaseOrders()
  const { data: goodsReceipts } = useGoodsReceipts()
  const { data: purchaseReturns } = usePurchaseReturns()
  const [filters, setFilters] = useState<FilterValues>({})

  const invoiceSnapshots = useMemo(
    () =>
      buildInvoiceWorkflowSnapshots(
        invoices ?? [],
        purchaseOrders ?? [],
        goodsReceipts ?? [],
        purchaseReturns ?? [],
      ),
    [goodsReceipts, invoices, purchaseOrders, purchaseReturns],
  )

  const filteredData = useMemo(() => {
    return invoiceSnapshots.filter((invoice) => {
      if (filters.paymentStatus && invoice.paymentStatus !== filters.paymentStatus) return false
      if (filters.paymentReadiness && invoice.paymentReadiness !== filters.paymentReadiness) return false
      return true
    })
  }, [filters, invoiceSnapshots])

  const summary = useMemo(() => {
    const openInvoices = invoiceSnapshots.filter((invoice) => invoice.balanceAmount > 0)
    return {
      openCount: openInvoices.length,
      paymentReadyCount: openInvoices.filter((invoice) => invoice.paymentReadiness === "ready").length,
      awaitingReceiptCount: openInvoices.filter((invoice) => invoice.paymentReadiness === "awaiting_receipt").length,
      overdueCount: openInvoices.filter((invoice) => invoice.paymentStatus === "overdue").length,
    }
  }, [invoiceSnapshots])

  return (
    <Tabs defaultValue="list">
      <TabsList>
        <TabsTrigger value="overview">Workflow</TabsTrigger>
        <TabsTrigger value="list">All Invoices</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Invoice Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Invoice control is shown against the real procurement flow. Payments should move only on invoices that
                are receipt-matched and still carry an outstanding balance.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-md border border-border/70 bg-background/40 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Open</p>
                  <p className="mt-1 text-lg font-semibold">{summary.openCount}</p>
                </div>
                <div className="rounded-md border border-border/70 bg-background/40 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ready</p>
                  <p className="mt-1 text-lg font-semibold">{summary.paymentReadyCount}</p>
                </div>
                <div className="rounded-md border border-border/70 bg-background/40 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Awaiting GRN</p>
                  <p className="mt-1 text-lg font-semibold">{summary.awaitingReceiptCount}</p>
                </div>
                <div className="rounded-md border border-border/70 bg-background/40 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Overdue</p>
                  <p className="mt-1 text-lg font-semibold">{summary.overdueCount}</p>
                </div>
              </div>
            </div>

            <InvoiceOverviewList
              invoices={invoiceSnapshots}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="list" className="mt-4">
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          searchPlaceholder="Search invoices..."
          filterFields={[
            {
              key: "paymentStatus",
              label: "Payment Status",
              options: [
                { label: "Paid", value: "paid" },
                { label: "Partial", value: "partial" },
                { label: "Unpaid", value: "unpaid" },
                { label: "Overdue", value: "overdue" },
              ],
            },
            {
              key: "paymentReadiness",
              label: "Readiness",
              options: [
                { label: "Ready to Pay", value: "ready" },
                { label: "Awaiting Receipt", value: "awaiting_receipt" },
                { label: "Fully Settled", value: "fully_paid" },
                { label: "Cancelled PO", value: "cancelled_order" },
              ],
            },
          ]}
          filterValues={filters}
          onFilterChange={setFilters}
          exportFilename="purchase-invoices"
          emptyTitle="No invoices found"
          emptyDescription="Invoices appear here after confirmed purchase orders are received."
        />
      </TabsContent>
    </Tabs>
  )
}
