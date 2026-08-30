"use client"

import { useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { formatCurrency } from "@/lib/format"
import { useGoodsReceipts } from "../hooks/useGoodsReceipt"
import { purchaseReturnFormSchema, type PurchaseReturnFormValues } from "../schemas/payment.schema"
import { useCreatePurchaseReturn, useInvoices, usePurchaseReturns } from "../hooks/usePayments"
import { usePurchaseOrders } from "../hooks/usePurchaseOrders"
import { buildInvoiceWorkflowSnapshots, buildReturnableLinesForInvoice } from "../lib/workflow"
import type { ReturnReason } from "../types"

const reasonOptions: { value: ReturnReason; label: string }[] = [
  { value: "damaged_product", label: "Damaged Product" },
  { value: "wrong_item", label: "Wrong Item" },
  { value: "quality_issue", label: "Quality Issue" },
  { value: "supplier_return", label: "Supplier Return" },
]

export function PurchaseReturnForm({ onCreated }: { onCreated?: () => void }) {
  const { data: invoices } = useInvoices()
  const { data: purchaseOrders } = usePurchaseOrders()
  const { data: goodsReceipts } = useGoodsReceipts()
  const { data: purchaseReturns } = usePurchaseReturns()
  const createReturn = useCreatePurchaseReturn()

  const form = useForm<PurchaseReturnFormValues>({
    resolver: zodResolver(purchaseReturnFormSchema),
    defaultValues: {
      supplierId: "",
      purchaseInvoiceId: "",
      reason: "damaged_product",
      items: [],
      notes: "",
    },
  })

  const { fields, replace } = useFieldArray({ control: form.control, name: "items" })
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
    (invoice) => invoice.supplierId === supplierId && invoice.returnableQuantity > 0,
  )
  const selectedInvoice = invoiceSnapshots.find((invoice) => invoice.id === purchaseInvoiceId)
  const sourceOrder = (purchaseOrders ?? []).find((order) => order.id === selectedInvoice?.purchaseOrderId)

  useEffect(() => {
    if (!selectedInvoice || !sourceOrder) {
      replace([])
      return
    }

    replace(
      buildReturnableLinesForInvoice(selectedInvoice, purchaseOrders ?? [], goodsReceipts ?? [], purchaseReturns ?? []).map((item) => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        color: item.color,
        size: item.size,
        receivedQty: item.receivedQty,
        returnedQty: item.returnedQty,
        quantity: 0,
        unitCost: item.unitCost,
        maxQuantity: item.availableQty,
      })),
    )
  }, [goodsReceipts, purchaseInvoiceId, purchaseOrders, purchaseReturns, replace, selectedInvoice, sourceOrder])

  const chosenItems = form.watch("items").filter((item) => item.quantity > 0)
  const totalValue = chosenItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)

  function onSubmit(values: PurchaseReturnFormValues) {
    const selectedItems = values.items.filter((item) => item.quantity > 0)
    if (!selectedInvoice || selectedInvoice.returnableQuantity <= 0) {
      form.setError("purchaseInvoiceId", { message: "This invoice has no received quantity available to return" })
      return
    }
    if (selectedItems.length === 0) {
      form.setError("items", { message: "Select at least one return line with quantity greater than zero" })
      return
    }

    createReturn.mutate(
      {
        ...values,
        items: selectedItems,
      },
      {
        onSuccess: () => {
          form.reset({
            supplierId: "",
            purchaseInvoiceId: "",
            reason: "damaged_product",
            items: [],
            notes: "",
          })
          replace([])
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
            <CardTitle className="text-base">Purchase Return</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue("purchaseInvoiceId", "")
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from(new Map((invoices ?? []).map((invoice) => [invoice.supplierId, invoice.supplierName])).entries()).map(
                        ([id, name]) => (
                          <SelectItem key={id} value={id}>
                            {name}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
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
                  <Select value={field.value} onValueChange={field.onChange} disabled={!supplierId}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={supplierId ? "Select invoice" : "Select a supplier first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supplierInvoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoiceNumber} - {invoice.poNumber} - returnable {invoice.returnableQuantity} units
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {supplierId && supplierInvoices.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      This supplier has no invoice with received quantity currently available for return.
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasonOptions.map((option) => (
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional context..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Return Lines</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!selectedInvoice || !sourceOrder ? (
              <EmptyState
                title="Select an invoice"
                description="Choose a supplier invoice first to load the source purchase order items available for return."
              />
            ) : fields.length === 0 ? (
              <EmptyState title="No line items found" description="This purchase order has no items available to return." />
            ) : (
              <>
                <div className="rounded-lg border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Source: {selectedInvoice.invoiceNumber} / {selectedInvoice.poNumber}. Receipt-matched quantity available
                  for return: {selectedInvoice.returnableQuantity} units. Returned items will reduce stock and apply
                  supplier credit when the return is completed.
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Already Returned</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Return Qty</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const maxQuantity = form.watch(`items.${index}.maxQuantity`) ?? 0
                      const receivedQty = form.watch(`items.${index}.receivedQty`) ?? 0
                      const returnedQty = form.watch(`items.${index}.returnedQty`) ?? 0
                      const quantity = form.watch(`items.${index}.quantity`) ?? 0
                      const unitCost = form.watch(`items.${index}.unitCost`) ?? 0
                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <p className="font-medium">{field.productName}</p>
                            <p className="font-mono text-xs text-muted-foreground">{field.sku}</p>
                          </TableCell>
                          <TableCell>{receivedQty}</TableCell>
                          <TableCell>{returnedQty}</TableCell>
                          <TableCell>{maxQuantity}</TableCell>
                          <TableCell className="w-40">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field: qtyField }) => (
                                <FormItem>
                                  <FormControl>
                                    <QuantityInput
                                      value={qtyField.value}
                                      onChange={(nextValue) =>
                                        qtyField.onChange(Math.max(0, Math.min(nextValue, maxQuantity)))
                                      }
                                      min={0}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="w-36">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitCost`}
                              render={({ field: costField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      value={costField.value}
                                      onChange={(e) => costField.onChange(Number(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>{formatCurrency(quantity * unitCost)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </>
            )}

            {chosenItems.length > 0 && (
              <div className="rounded-lg border border-border/70 px-4 py-3 text-sm text-muted-foreground">
                Estimated return value: <span className="font-semibold text-foreground">{formatCurrency(totalValue)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createReturn.isPending}>
            Submit Return
          </Button>
        </div>
      </form>
    </Form>
  )
}
