"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { ProductPurchaseSelector } from "@/components/purchase/ProductPurchaseSelector"
import { QuantityInput } from "@/components/inventory/QuantityInput"
import { useProducts } from "@/features/products/hooks/useProducts"
import { purchaseRequestFormSchema, type PurchaseRequestFormValues } from "../schemas/purchase.schema"
import { useCreatePurchaseRequest } from "../hooks/usePurchaseOrders"

/** Purchase Request form — internal request before purchasing, with product line items. */
export function PurchaseRequestForm({ onCreated }: { onCreated?: () => void }) {
  const { data: products } = useProducts()
  const createRequest = useCreatePurchaseRequest()
  const [pendingProductId, setPendingProductId] = useState("")
  const [pendingReason, setPendingReason] = useState("")

  const form = useForm<PurchaseRequestFormValues>({
    resolver: zodResolver(purchaseRequestFormSchema),
    defaultValues: { department: "", requester: "", requiredDate: "", items: [], notes: "" },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  function handleAddProduct() {
    const product = (products ?? []).find((p) => p.id === pendingProductId)
    if (!product || !pendingReason) return
    append({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: 1,
      reason: pendingReason,
    })
    setPendingProductId("")
    setPendingReason("")
  }

  function onSubmit(values: PurchaseRequestFormValues) {
    createRequest.mutate(values, {
      onSuccess: () => {
        form.reset({ department: "", requester: "", requiredDate: "", items: [], notes: "" })
        onCreated?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Purchase Request</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Retail Operations" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requester</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requiredDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
            <CardTitle className="text-base">Products</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <ProductPurchaseSelector value={pendingProductId} onChange={setPendingProductId} />
              <Input placeholder="Reason" value={pendingReason} onChange={(e) => setPendingReason(e.target.value)} />
              <Button type="button" variant="outline" onClick={handleAddProduct} disabled={!pendingProductId || !pendingReason}>
                <Plus /> Add
              </Button>
            </div>

            {fields.length === 0 ? (
              <EmptyState title="No products added" description="Select a product and reason above, then add it to the request." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
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
                      <TableCell className="max-w-xs">{field.reason}</TableCell>
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
          <Button type="submit" disabled={createRequest.isPending}>
            Save as Draft
          </Button>
        </div>
      </form>
    </Form>
  )
}
