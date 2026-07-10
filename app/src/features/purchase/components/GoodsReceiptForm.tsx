"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { WarehouseSelector } from "@/components/inventory/WarehouseSelector"
import { QuantityInput } from "@/components/inventory/QuantityInput"
import { goodsReceiptFormSchema, type GoodsReceiptFormValues } from "../schemas/receipt.schema"
import { usePurchaseOrders } from "../hooks/usePurchaseOrders"
import { useCreateGoodsReceipt } from "../hooks/useGoodsReceipt"

/** Goods Receipt Note form — links to a PO, records received/rejected quantities per line, confirms into a warehouse. */
export function GoodsReceiptForm({ onConfirmed }: { onConfirmed?: () => void }) {
  const { data: orders } = usePurchaseOrders()
  const createReceipt = useCreateGoodsReceipt()

  const receivableOrders = (orders ?? []).filter((o) =>
    ["approved", "partially_received"].includes(o.status)
  )

  const form = useForm<GoodsReceiptFormValues>({
    resolver: zodResolver(goodsReceiptFormSchema),
    defaultValues: { purchaseOrderId: "", warehouseId: "", items: [] },
  })

  const { fields, replace, update } = useFieldArray({ control: form.control, name: "items" })
  const purchaseOrderId = form.watch("purchaseOrderId")
  const selectedOrder = receivableOrders.find((o) => o.id === purchaseOrderId)

  useEffect(() => {
    if (!selectedOrder) {
      replace([])
      return
    }
    replace(
      selectedOrder.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        color: item.color,
        size: item.size,
        orderedQty: item.quantity,
        receivedQty: item.quantity,
        rejectedQty: 0,
      }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrder?.id])

  function onSubmit(values: GoodsReceiptFormValues) {
    createReceipt.mutate(values, {
      onSuccess: () => {
        form.reset({ purchaseOrderId: "", warehouseId: "", items: [] })
        onConfirmed?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Goods Receipt</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="purchaseOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Order</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select purchase order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {receivableOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.poNumber} — {order.supplierName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <div className="flex h-8 items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
                {selectedOrder?.supplierName ?? "—"}
              </div>
            </FormItem>
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse</FormLabel>
                  <FormControl>
                    <WarehouseSelector value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Received Items</CardTitle>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <EmptyState title="Select a purchase order" description="Line items will appear here once a PO is selected." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Ordered Qty</TableHead>
                    <TableHead>Received Qty</TableHead>
                    <TableHead>Rejected Qty</TableHead>
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
                      <TableCell>{field.orderedQty}</TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.receivedQty`}
                          render={({ field: qtyField }) => (
                            <FormItem>
                              <FormControl>
                                <QuantityInput
                                  value={qtyField.value}
                                  onChange={(value) => update(index, { ...field, receivedQty: value })}
                                  min={0}
                                  max={field.orderedQty}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.rejectedQty`}
                          render={({ field: qtyField }) => (
                            <FormItem>
                              <FormControl>
                                <QuantityInput
                                  value={qtyField.value}
                                  onChange={(value) => update(index, { ...field, rejectedQty: value })}
                                  min={0}
                                  max={field.orderedQty}
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
          <Button type="submit" disabled={fields.length === 0 || createReceipt.isPending}>
            <CheckCircle2 /> Confirm Receipt
          </Button>
        </div>
      </form>
    </Form>
  )
}
