"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { WarehouseSelector } from "@/components/inventory/WarehouseSelector"
import { QuantityInput } from "@/components/inventory/QuantityInput"
import { EmptyState } from "@/components/ui/empty-state"
import { transferFormSchema, type TransferFormValues } from "../schemas/transfer.schema"
import { useInventory } from "../hooks/useInventory"
import { useCreateTransfer } from "../hooks/useStockMovement"

/** Stock Transfer form — From/To warehouse, product line items with available-qty validation. */
export function StockTransferForm({ onCreated }: { onCreated?: () => void }) {
  const { data: inventory } = useInventory()
  const createTransfer = useCreateTransfer()
  const [pendingProductId, setPendingProductId] = useState("")

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: { fromWarehouseId: "", toWarehouseId: "", items: [] },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const fromWarehouseId = form.watch("fromWarehouseId")

  const availableItems = (inventory ?? []).filter((item) => item.warehouseId === fromWarehouseId)

  function handleAddProduct() {
    const item = availableItems.find((i) => i.id === pendingProductId)
    if (!item) return
    append({
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      variantLabel: [item.color, item.size].filter(Boolean).join(" / ") || undefined,
      availableQty: item.availableQty,
      transferQty: 1,
    })
    setPendingProductId("")
  }

  function onSubmit(values: TransferFormValues) {
    createTransfer.mutate(values, {
      onSuccess: () => {
        form.reset({ fromWarehouseId: "", toWarehouseId: "", items: [] })
        onCreated?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Transfer</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fromWarehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Warehouse</FormLabel>
                  <FormControl>
                    <WarehouseSelector
                      value={field.value}
                      onChange={(id) => {
                        field.onChange(id)
                        form.setValue("items", [])
                      }}
                      placeholder="Select source warehouse"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toWarehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Warehouse</FormLabel>
                  <FormControl>
                    <WarehouseSelector
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select destination warehouse"
                      disabled={fromWarehouseId ? [fromWarehouseId] : []}
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
            <CardTitle className="text-base">Product Selection</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <FormLabel>Product</FormLabel>
                <Select value={pendingProductId} onValueChange={setPendingProductId} disabled={!fromWarehouseId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={fromWarehouseId ? "Select product" : "Select a from-warehouse first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.productName} {item.color || item.size ? `(${[item.color, item.size].filter(Boolean).join(" / ")})` : ""} — {item.availableQty} available
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" onClick={handleAddProduct} disabled={!pendingProductId}>
                <Plus /> Add
              </Button>
            </div>

            {fields.length === 0 ? (
              <EmptyState title="No products added" description="Select a product above to add it to the transfer." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Available Qty</TableHead>
                    <TableHead>Transfer Qty</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{field.productName}</TableCell>
                      <TableCell>{field.variantLabel ?? "—"}</TableCell>
                      <TableCell>{field.availableQty}</TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.transferQty`}
                          render={({ field: qtyField }) => (
                            <FormItem>
                              <FormControl>
                                <QuantityInput
                                  value={qtyField.value}
                                  onChange={qtyField.onChange}
                                  min={1}
                                  max={field.availableQty}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Button type="button" size="icon" variant="ghost" onClick={() => remove(index)} aria-label="Remove line">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {form.formState.errors.items?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createTransfer.isPending}>
            Submit Transfer
          </Button>
        </div>
      </form>
    </Form>
  )
}
