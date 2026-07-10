"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
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
import { QuantityInput } from "@/components/inventory/QuantityInput"
import { PurchaseSummaryCard } from "@/components/purchase/PurchaseSummaryCard"
import { formatCurrency } from "@/lib/format"
import { useProducts } from "@/features/products/hooks/useProducts"
import { salesOrderFormSchema, type SalesOrderFormValues } from "../schemas/sales.schema"
import { useCreateSalesOrder } from "../hooks/useSales"
import { CustomerSelector } from "./CustomerSelector"

/** Sales Order create form — customer, product line items, delivery date, payment terms, notes. */
export function SalesOrderForm() {
  const router = useRouter()
  const { data: products } = useProducts()
  const createOrder = useCreateSalesOrder()
  const [pendingProductId, setPendingProductId] = useState("")

  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderFormSchema),
    defaultValues: { customerId: "", items: [], deliveryDate: "", paymentTerms: "", notes: "" },
  })

  const { fields, append, remove, update } = useFieldArray({ control: form.control, name: "items" })
  const items = form.watch("items")

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    const discountTotal = items.reduce((sum, item) => sum + (item.discount || 0), 0)
    const taxTotal = items.reduce((sum, item) => sum + (item.tax || 0), 0)
    return { subtotal, discountTotal, taxTotal, grandTotal: subtotal - discountTotal + taxTotal }
  }, [items])

  function handleAddProduct() {
    const product = (products ?? []).find((p) => p.id === pendingProductId)
    if (!product) return
    append({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: 1,
      price: product.sellingPrice,
      discount: 0,
      tax: 0,
    })
    setPendingProductId("")
  }

  function onSubmit(values: SalesOrderFormValues) {
    createOrder.mutate(values, { onSuccess: () => router.push("/dashboard/sales/orders") })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <CustomerSelector value={field.value} onChange={(id) => field.onChange(id ?? "")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Due on delivery" {...field} />
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
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <FormLabel>Product</FormLabel>
                <Select value={pendingProductId} onValueChange={setPendingProductId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {(products ?? []).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} — {product.sku}
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
              <EmptyState title="No products added" description="Select a product above to add it to this order." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const item = items[index]
                    const amount = item ? item.quantity * item.price - (item.discount || 0) + (item.tax || 0) : 0
                    return (
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
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item?.price ?? 0}
                            onChange={(e) => update(index, { ...item, price: Number(e.target.value) || 0 })}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(amount)}</TableCell>
                        <TableCell>
                          <Button type="button" size="icon" variant="ghost" onClick={() => remove(index)} aria-label="Remove line">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
            {form.formState.errors.items?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:max-w-xs sm:self-end">
          <PurchaseSummaryCard
            subtotal={totals.subtotal}
            taxTotal={totals.taxTotal}
            discountTotal={totals.discountTotal}
            grandTotal={totals.grandTotal}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={createOrder.isPending}>
            Create Sales Order
          </Button>
        </div>
      </form>
    </Form>
  )
}
