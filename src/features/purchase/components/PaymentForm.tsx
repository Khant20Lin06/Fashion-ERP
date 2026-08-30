"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SupplierSelector } from "@/components/purchase/SupplierSelector"
import { formatCurrency, formatPercent } from "@/lib/format"
import { useGoodsReceipts } from "../hooks/useGoodsReceipt"
import { paymentFormSchema, type PaymentFormValues } from "../schemas/payment.schema"
import { useCreatePayment, useInvoices, usePaymentMethods, usePurchaseReturns } from "../hooks/usePayments"
import { usePurchaseOrders } from "../hooks/usePurchaseOrders"
import { buildInvoiceWorkflowSnapshots } from "../lib/workflow"

/** Supplier Payment form - pay against an outstanding purchase invoice. */
export function PaymentForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { data: invoices } = useInvoices()
  const { data: purchaseOrders } = usePurchaseOrders()
  const { data: goodsReceipts } = useGoodsReceipts()
  const { data: purchaseReturns } = usePurchaseReturns()
  const { data: paymentMethods } = usePaymentMethods()
  const createPayment = useCreatePayment()

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      supplierId: "",
      purchaseInvoiceId: "",
      paymentMethodId: "",
      paymentDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      referenceNumber: "",
      notes: "",
    },
  })

  const supplierId = form.watch("supplierId")
  const purchaseInvoiceId = form.watch("purchaseInvoiceId")
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
  const supplierInvoices = invoiceSnapshots.filter(
    (invoice) => invoice.supplierId === supplierId && invoice.balanceAmount > 0,
  )
  const paymentReadyInvoices = supplierInvoices.filter((invoice) => invoice.paymentReadiness === "ready")
  const selectedInvoice = invoiceSnapshots.find((invoice) => invoice.id === purchaseInvoiceId)
  const outstandingBalance = selectedInvoice?.balanceAmount

  function onSubmit(values: PaymentFormValues) {
    if (!selectedInvoice) {
      form.setError("purchaseInvoiceId", { message: "Select a purchase invoice" })
      return
    }
    if (selectedInvoice.paymentReadiness !== "ready") {
      form.setError("purchaseInvoiceId", {
        message: selectedInvoice.paymentBlockedReason ?? "This invoice is not ready for payment",
      })
      return
    }
    if (values.amount > selectedInvoice.balanceAmount) {
      form.setError("amount", { message: "Payment amount cannot exceed the outstanding balance" })
      return
    }
    createPayment.mutate(values, {
      onSuccess: () => {
        form.reset({
          supplierId: "",
          purchaseInvoiceId: "",
          paymentMethodId: "",
          paymentDate: new Date().toISOString().slice(0, 10),
          amount: 0,
          referenceNumber: "",
          notes: "",
        })
        onSubmitted?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier Payment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <SupplierSelector
                      value={field.value}
                      onChange={(id) => {
                        field.onChange(id)
                        form.setValue("purchaseInvoiceId", "")
                        form.setValue("amount", 0)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseInvoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Invoice</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      const invoice = supplierInvoices.find((entry) => entry.id === value)
                      if (invoice) {
                        form.setValue("amount", invoice.balanceAmount)
                      }
                    }}
                    disabled={!supplierId}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={supplierId ? "Select purchase invoice" : "Select a supplier first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supplierInvoices.map((invoice) => (
                        <SelectItem
                          key={invoice.id}
                          value={invoice.id}
                          disabled={invoice.paymentReadiness !== "ready"}
                        >
                          {invoice.invoiceNumber} - {invoice.poNumber} - due{" "}
                          {new Date(invoice.dueDate).toLocaleDateString()} - {formatCurrency(invoice.balanceAmount)} -{" "}
                          {invoice.paymentReadinessLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {supplierId && supplierInvoices.length > 0 && paymentReadyInvoices.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      This supplier has open invoices, but none are receipt-matched and payment-ready yet.
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Amount{outstandingBalance !== undefined ? ` (${formatCurrency(outstandingBalance)} outstanding)` : ""}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(paymentMethods ?? []).map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Transaction/reference number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedInvoice ? (
              <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground sm:col-span-2">
                <p className="font-medium text-foreground">{selectedInvoice.invoiceNumber}</p>
                <p>
                  Receipt match: {selectedInvoice.goodsReceiptCount} GRN linked,{" "}
                  {formatPercent(selectedInvoice.receiptCoveragePercent)} received coverage.
                </p>
                <p>
                  Payment readiness: {selectedInvoice.paymentReadinessLabel}
                  {selectedInvoice.paymentBlockedReason ? ` - ${selectedInvoice.paymentBlockedReason}` : ""}
                </p>
                {selectedInvoice.supplierCreditAmount > 0 ? (
                  <p>Supplier credit already available: {formatCurrency(selectedInvoice.supplierCreditAmount)}</p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createPayment.isPending || !selectedInvoice || selectedInvoice.paymentReadiness !== "ready"}
          >
            Record Payment
          </Button>
        </div>
      </form>
    </Form>
  )
}
