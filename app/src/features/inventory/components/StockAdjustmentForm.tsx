"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
import { formatNumber } from "@/lib/format"
import { adjustmentFormSchema, type AdjustmentFormValues } from "../schemas/adjustment.schema"
import { useInventory } from "../hooks/useInventory"
import { useCreateStockAdjustment } from "../hooks/useStockMovement"
import type { AdjustmentType } from "../types"

const adjustmentTypeOptions: { value: AdjustmentType; label: string }[] = [
  { value: "stock_count_difference", label: "Stock Count Difference" },
  { value: "damaged_product", label: "Damaged Product" },
  { value: "lost_item", label: "Lost Item" },
  { value: "expired_item", label: "Expired Item" },
  { value: "manual_correction", label: "Manual Correction" },
]

/** Stock Adjustment form — corrects inventory differences with a required reason. */
export function StockAdjustmentForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { data: inventory } = useInventory()
  const createAdjustment = useCreateStockAdjustment()
  const [warehouseId, setWarehouseId] = useState("")

  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      warehouseId: "",
      productId: "",
      currentQty: 0,
      adjustedQty: 0,
      type: "manual_correction",
      reason: "",
      notes: "",
    },
  })

  const itemsInWarehouse = (inventory ?? []).filter((item) => item.warehouseId === warehouseId)
  const adjustedQty = form.watch("adjustedQty")
  const currentQty = form.watch("currentQty")
  const difference = adjustedQty - currentQty

  function handleProductChange(productId: string) {
    const item = itemsInWarehouse.find((i) => i.productId === productId)
    form.setValue("productId", productId)
    form.setValue("currentQty", item?.availableQty ?? 0)
    form.setValue("adjustedQty", item?.availableQty ?? 0)
  }

  function onSubmit(values: AdjustmentFormValues) {
    createAdjustment.mutate(values, {
      onSuccess: () => {
        form.reset({
          warehouseId: "",
          productId: "",
          currentQty: 0,
          adjustedQty: 0,
          type: "manual_correction",
          reason: "",
          notes: "",
        })
        setWarehouseId("")
        onSubmitted?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Adjustment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse</FormLabel>
                  <FormControl>
                    <WarehouseSelector
                      value={field.value}
                      onChange={(id) => {
                        field.onChange(id)
                        setWarehouseId(id)
                        form.setValue("productId", "")
                        form.setValue("currentQty", 0)
                        form.setValue("adjustedQty", 0)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select value={field.value} onValueChange={handleProductChange} disabled={!warehouseId}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={warehouseId ? "Select product" : "Select a warehouse first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {itemsInWarehouse.map((item) => (
                        <SelectItem key={item.id} value={item.productId}>
                          {item.productName}
                          {item.color || item.size ? ` (${[item.color, item.size].filter(Boolean).join(" / ")})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Current Quantity</FormLabel>
              <FormControl>
                <div className="flex h-8 items-center rounded-lg border bg-muted px-3 text-sm">
                  {formatNumber(currentQty)}
                </div>
              </FormControl>
            </FormItem>

            <FormField
              control={form.control}
              name="adjustedQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjusted Quantity</FormLabel>
                  <FormControl>
                    <QuantityInput value={field.value} onChange={field.onChange} min={0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Difference</FormLabel>
              <p className={difference > 0 ? "font-semibold text-success" : difference < 0 ? "font-semibold text-destructive" : "font-semibold text-muted-foreground"}>
                {difference > 0 ? "+" : ""}
                {formatNumber(difference)}
              </p>
            </FormItem>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {adjustmentTypeOptions.map((option) => (
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
                    <Textarea placeholder="Explain the reason for this adjustment…" rows={2} {...field} />
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
                    <Textarea placeholder="Additional notes…" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createAdjustment.isPending}>
            Submit Adjustment
          </Button>
        </div>
      </form>
    </Form>
  )
}
