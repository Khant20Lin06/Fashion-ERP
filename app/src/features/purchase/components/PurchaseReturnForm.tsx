"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
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
import { SupplierSelector } from "@/components/purchase/SupplierSelector"
import { ProductPurchaseSelector } from "@/components/purchase/ProductPurchaseSelector"
import { QuantityInput } from "@/components/inventory/QuantityInput"
import { formatCurrency } from "@/lib/format"
import { useProducts } from "@/features/products/hooks/useProducts"
import { purchaseReturnFormSchema, type PurchaseReturnFormValues } from "../schemas/payment.schema"
import { useCreatePurchaseReturn } from "../hooks/usePayments"
import type { ReturnReason } from "../types"

const reasonOptions: { value: ReturnReason; label: string }[] = [
  { value: "damaged_product", label: "Damaged Product" },
  { value: "wrong_item", label: "Wrong Item" },
  { value: "quality_issue", label: "Quality Issue" },
  { value: "supplier_return", label: "Supplier Return" },
]

/** Purchase Return form — return products to a supplier with a reason. */
export function PurchaseReturnForm({ onCreated }: { onCreated?: () => void }) {
  const { data: products } = useProducts()
  const createReturn = useCreatePurchaseReturn()
  const [pendingProductId, setPendingProductId] = useState("")

  const form = useForm<PurchaseReturnFormValues>({
    resolver: zodResolver(purchaseReturnFormSchema),
    defaultValues: { supplierId: "", reason: "damaged_product", items: [], notes: "" },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  function handleAddProduct() {
    const product = (products ?? []).find((p) => p.id === pendingProductId)
    if (!product) return
    append({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: 1,
      unitCost: 0,
    })
    setPendingProductId("")
  }

  function onSubmit(values: PurchaseReturnFormValues) {
    createReturn.mutate(values, {
      onSuccess: () => {
        form.reset({ supplierId: "", reason: "damaged_product", items: [], notes: "" })
        onCreated?.()
      },
    })
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
                  <FormControl>
                    <SupplierSelector value={field.value} onChange={field.onChange} />
                  </FormControl>
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
                <FormItem className="sm:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional context…" rows={2} {...field} />
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
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <ProductPurchaseSelector value={pendingProductId} onChange={setPendingProductId} />
              </div>
              <Button type="button" variant="outline" onClick={handleAddProduct} disabled={!pendingProductId}>
                <Plus /> Add
              </Button>
            </div>

            {fields.length === 0 ? (
              <EmptyState title="No products added" description="Select a product above to add it to the return." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <p className="font-medium">{field.productName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{field.sku}</p>
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field: qtyField }) => (
                            <FormItem>
                              <FormControl>
                                <QuantityInput value={qtyField.value} onChange={qtyField.onChange} min={1} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
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
                                  className="w-24"
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
            {fields.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Total return value:{" "}
                {formatCurrency(
                  form.watch("items").reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
                )}
              </p>
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
