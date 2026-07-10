"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { EmptyState } from "@/components/ui/empty-state"
import { QuantityInput } from "@/components/inventory/QuantityInput"
import { salesReturnFormSchema, type SalesReturnFormValues } from "../schemas/sales.schema"
import { useInvoices, useCreateSalesReturn } from "../hooks/useInvoice"
import type { PaymentMethod, ReturnType } from "../types"

const typeOptions: { value: ReturnType; label: string }[] = [
  { value: "product_return", label: "Product Return" },
  { value: "exchange", label: "Exchange" },
  { value: "refund", label: "Refund" },
  { value: "store_credit", label: "Store Credit" },
]

const refundMethodOptions: { value: PaymentMethod | "store_credit"; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mobile_payment", label: "Mobile Payment" },
  { value: "store_credit", label: "Store Credit" },
]

/** Returns & Refund form — select an invoice, choose products/quantities to return, and a refund method. */
export function ReturnForm({ onCreated }: { onCreated?: () => void }) {
  const { data: invoices } = useInvoices()
  const createReturn = useCreateSalesReturn()

  const form = useForm<SalesReturnFormValues>({
    resolver: zodResolver(salesReturnFormSchema),
    defaultValues: { invoiceId: "", type: "product_return", reason: "", refundMethod: "cash", items: [] },
  })

  const { fields, replace, update } = useFieldArray({ control: form.control, name: "items" })
  const invoiceId = form.watch("invoiceId")
  const selectedInvoice = (invoices ?? []).find((i) => i.id === invoiceId)

  useEffect(() => {
    if (!selectedInvoice) {
      replace([])
      return
    }
    replace(
      selectedInvoice.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        color: item.color,
        size: item.size,
        purchasedQty: item.quantity,
        returnQty: 0,
        unitPrice: item.price,
      }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInvoice?.id])

  function onSubmit(values: SalesReturnFormValues) {
    const itemsToReturn = values.items.filter((item) => item.returnQty > 0)
    if (itemsToReturn.length === 0) return
    createReturn.mutate(
      { ...values, items: itemsToReturn },
      {
        onSuccess: () => {
          form.reset({ invoiceId: "", type: "product_return", reason: "", refundMethod: "cash", items: [] })
          onCreated?.()
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Return Request</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select invoice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(invoices ?? []).map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoiceNumber} — {invoice.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <div className="flex h-8 items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
                {selectedInvoice?.customerName ?? "—"}
              </div>
            </FormItem>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typeOptions.map((option) => (
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
              name="refundMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refund Method</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {refundMethodOptions.map((option) => (
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
              name="reason"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Reason for return…" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Products to Return</CardTitle>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <EmptyState title="Select an invoice" description="Line items will appear here once an invoice is selected." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Purchased Qty</TableHead>
                    <TableHead>Return Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <p className="font-medium">{field.productName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{field.sku}</p>
                      </TableCell>
                      <TableCell>{[field.color, field.size].filter(Boolean).join(" / ") || "—"}</TableCell>
                      <TableCell>{field.purchasedQty}</TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.returnQty`}
                          render={({ field: qtyField }) => (
                            <FormItem>
                              <FormControl>
                                <QuantityInput
                                  value={qtyField.value}
                                  onChange={(value) => update(index, { ...field, returnQty: value })}
                                  min={0}
                                  max={field.purchasedQty}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={fields.length === 0 || createReturn.isPending}>
            <Undo2 /> Submit Return
          </Button>
        </div>
      </form>
    </Form>
  )
}
