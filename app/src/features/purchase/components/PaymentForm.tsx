"use client"

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
import { formatCurrency } from "@/lib/format"
import { paymentFormSchema, type PaymentFormValues } from "../schemas/payment.schema"
import { useInvoices, useCreatePayment } from "../hooks/usePayments"
import type { PaymentMethod } from "../types"

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "credit", label: "Credit" },
  { value: "mobile_payment", label: "Mobile Payment" },
]

/** Supplier Payment form — pay against an outstanding invoice. */
export function PaymentForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { data: invoices } = useInvoices()
  const createPayment = useCreatePayment()

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      supplierId: "",
      invoiceId: "",
      paymentDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      method: "bank_transfer",
      referenceNumber: "",
      notes: "",
    },
  })

  const supplierId = form.watch("supplierId")
  const invoiceId = form.watch("invoiceId")
  const supplierInvoices = (invoices ?? []).filter(
    (invoice) => invoice.supplierId === supplierId && invoice.paymentStatus !== "paid"
  )
  const selectedInvoice = (invoices ?? []).find((i) => i.id === invoiceId)
  const outstandingOnInvoice = selectedInvoice ? selectedInvoice.grandTotal - selectedInvoice.amountPaid : undefined

  function onSubmit(values: PaymentFormValues) {
    createPayment.mutate(values, {
      onSuccess: () => {
        form.reset({
          supplierId: "",
          invoiceId: "",
          paymentDate: new Date().toISOString().slice(0, 10),
          amount: 0,
          method: "bank_transfer",
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
                        form.setValue("invoiceId", "")
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!supplierId}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={supplierId ? "Select invoice" : "Select a supplier first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supplierInvoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoiceNumber} — {formatCurrency(invoice.grandTotal - invoice.amountPaid)} due
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
                  <FormLabel>Amount{outstandingOnInvoice !== undefined ? ` (${formatCurrency(outstandingOnInvoice)} due)` : ""}</FormLabel>
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
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {methodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
                    <Textarea placeholder="Additional notes…" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createPayment.isPending}>
            Record Payment
          </Button>
        </div>
      </form>
    </Form>
  )
}
