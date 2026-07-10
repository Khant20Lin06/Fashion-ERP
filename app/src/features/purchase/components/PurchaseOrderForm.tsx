"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { PurchaseSummaryCard } from "@/components/purchase/PurchaseSummaryCard"
import { QuantityInput } from "@/components/inventory/QuantityInput"
import { formatCurrency } from "@/lib/format"
import { useSuppliers } from "../hooks/useSuppliers"
import { useCreatePurchaseOrder } from "../hooks/usePurchaseOrders"
import { purchaseOrderFormSchema, type PurchaseOrderFormValues } from "../schemas/purchase.schema"
import { ProductSelector } from "./ProductSelector"
import { useProducts } from "@/features/products/hooks/useProducts"

/** Purchase Order create form — supplier info, product line items, live tax/discount/total summary. */
export function PurchaseOrderForm() {
  const router = useRouter()
  const { data: suppliers } = useSuppliers()
  const { data: products } = useProducts()
  const createOrder = useCreatePurchaseOrder()
  const [pendingProductId, setPendingProductId] = useState("")

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: { supplierId: "", contact: "", paymentTerms: "", deliveryDate: "", items: [] },
  })

  const { fields, append, remove, update } = useFieldArray({ control: form.control, name: "items" })
  const supplierId = form.watch("supplierId")
  const items = form.watch("items")
  const selectedSupplier = (suppliers ?? []).find((s) => s.id === supplierId)

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
    const discountTotal = items.reduce((sum, item) => sum + (item.discount || 0), 0)
    const taxTotal = items.reduce((sum, item) => sum + (item.tax || 0), 0)
    return { subtotal, discountTotal, taxTotal, grandTotal: subtotal - discountTotal + taxTotal }
  }, [items])

  function handleSupplierChange(id: string) {
    const supplier = (suppliers ?? []).find((s) => s.id === id)
    form.setValue("supplierId", id)
    form.setValue("contact", supplier?.contactPerson ?? "")
    form.setValue("paymentTerms", supplier?.paymentTerms ?? "")
  }

  function handleAddProduct() {
    const product = (products ?? []).find((p) => p.id === pendingProductId)
    if (!product) return
    append({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: 1,
      unitCost: product.sellingPrice,
      discount: 0,
      tax: 0,
    })
    setPendingProductId("")
  }

  function onSubmit(values: PurchaseOrderFormValues) {
    createOrder.mutate(values, {
      onSuccess: () => router.push("/dashboard/purchase/orders"),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <SupplierSelector value={field.value} onChange={handleSupplierChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <div className="flex h-8 items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
                {selectedSupplier?.contactPerson ?? "—"}
              </div>
            </FormItem>
            <FormItem>
              <FormLabel>Payment Terms</FormLabel>
              <div className="flex h-8 items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
                {selectedSupplier?.paymentTerms ?? "—"}
              </div>
            </FormItem>
            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Delivery</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Items</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <ProductSelector value={pendingProductId} onChange={setPendingProductId} />
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
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const item = items[index]
                    const amount = item ? item.quantity * item.unitCost - (item.discount || 0) + (item.tax || 0) : 0
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
                            value={item?.unitCost ?? 0}
                            onChange={(e) => update(index, { ...item, unitCost: Number(e.target.value) || 0 })}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item?.discount ?? 0}
                            onChange={(e) => update(index, { ...item, discount: Number(e.target.value) || 0 })}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item?.tax ?? 0}
                            onChange={(e) => update(index, { ...item, tax: Number(e.target.value) || 0 })}
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
            Submit PO
          </Button>
        </div>
      </form>
    </Form>
  )
}
