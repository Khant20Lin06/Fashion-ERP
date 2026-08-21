"use client"

import { useEffect, useMemo } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Undo2 } from "lucide-react"
import { QuantityInput } from "@/components/inventory/QuantityInput"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useCreateSalesReturn, useInvoices, useSalesReturns } from "../hooks/useInvoice"
import { salesReturnFormSchema, type SalesReturnFormValues } from "../schemas/sales.schema"

/** Returns form — create a return request only from confirmed, warehouse-backed invoices with remaining qty. */
export function ReturnForm({ onCreated }: { onCreated?: () => void }) {
  const { data: invoices } = useInvoices()
  const { data: salesReturns } = useSalesReturns()
  const createReturn = useCreateSalesReturn()

  const form = useForm<SalesReturnFormValues>({
    resolver: zodResolver(salesReturnFormSchema),
    defaultValues: { invoiceId: "", reason: "", notes: "", items: [] },
  })

  const { fields, replace } = useFieldArray({ control: form.control, name: "items" })
  const invoiceId = form.watch("invoiceId")
  const itemsError = Array.isArray(form.formState.errors.items) ? undefined : form.formState.errors.items?.message

  const remainingByInvoiceId = useMemo(() => {
    const map = new Map<string, Map<string, number>>()

    for (const invoice of invoices ?? []) {
      const lineItems = new Map<string, number>()
      for (const item of invoice.items) {
        lineItems.set(item.id, item.quantity)
      }
      map.set(invoice.id, lineItems)
    }

    for (const saleReturn of salesReturns ?? []) {
      if (saleReturn.status === "cancelled") continue
      const lineItems = map.get(saleReturn.saleId)
      if (!lineItems) continue

      for (const item of saleReturn.items) {
        lineItems.set(item.saleItemId, Math.max((lineItems.get(item.saleItemId) ?? 0) - item.returnQty, 0))
      }
    }

    return map
  }, [invoices, salesReturns])

  const availableInvoices = useMemo(
    () =>
      (invoices ?? []).filter((invoice) => {
        if (invoice.status !== "CONFIRMED") return false
        if (!invoice.warehouseId) return false
        const lineItems = remainingByInvoiceId.get(invoice.id)
        return Array.from(lineItems?.values() ?? []).some((remaining) => remaining > 0)
      }),
    [invoices, remainingByInvoiceId],
  )

  const selectedInvoice = availableInvoices.find((invoice) => invoice.id === invoiceId)

  useEffect(() => {
    if (!selectedInvoice) {
      replace([])
      return
    }

    const remainingForInvoice = remainingByInvoiceId.get(selectedInvoice.id) ?? new Map<string, number>()

    replace(
      selectedInvoice.items.map((item) => ({
        saleItemId: item.id,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        color: item.color,
        size: item.size,
        purchasedQty: item.quantity,
        maxReturnableQty: Math.max(remainingForInvoice.get(item.id) ?? 0, 0),
        returnQty: 0,
        unitPrice: item.price,
        condition: "RESTOCK" as const,
      })),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInvoice?.id, remainingByInvoiceId])

  function onSubmit(values: SalesReturnFormValues) {
    const itemsToReturn = values.items.filter((item) => item.returnQty > 0)
    if (itemsToReturn.length === 0) return

    createReturn.mutate(
      { ...values, items: itemsToReturn },
      {
        onSuccess: () => {
          form.reset({ invoiceId: "", reason: "", notes: "", items: [] })
          onCreated?.()
        },
      },
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
                      {availableInvoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoiceNumber} — {invoice.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(invoices ?? []).length > 0 && availableInvoices.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No confirmed invoices with a warehouse and remaining returnable items are available.
                    </p>
                  ) : null}
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
              name="reason"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Reason for return..." rows={2} {...field} />
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
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add extra details for this return..."
                      rows={2}
                      {...field}
                      value={field.value ?? ""}
                    />
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
              <EmptyState
                title="Select an invoice"
                description="Only invoices with a warehouse and remaining returnable quantity will appear here."
              />
            ) : (
              <div className="space-y-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Purchased Qty</TableHead>
                      <TableHead>Condition</TableHead>
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
                        <TableCell>
                          <p>{field.purchasedQty}</p>
                          <p className="text-xs text-muted-foreground">Remaining: {field.maxReturnableQty}</p>
                        </TableCell>
                        <TableCell className="align-top">
                          <FormField
                            control={form.control}
                            name={`items.${index}.condition`}
                            render={({ field: conditionField }) => (
                              <FormItem>
                                <Select value={conditionField.value} onValueChange={conditionField.onChange}>
                                  <FormControl>
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue placeholder="Select condition" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="RESTOCK">Restock</SelectItem>
                                    <SelectItem value="DAMAGED">Damaged</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          <FormField
                            control={form.control}
                            name={`items.${index}.returnQty`}
                            render={({ field: qtyField }) => (
                              <FormItem>
                                <FormControl>
                                  <QuantityInput
                                    value={qtyField.value}
                                    onChange={qtyField.onChange}
                                    min={0}
                                    max={field.maxReturnableQty}
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
                {itemsError ? <p className="text-sm font-medium text-destructive">{itemsError}</p> : null}
              </div>
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
