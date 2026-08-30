"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
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
import { toastApiError } from "@/lib/api/errors"
import { formatCurrency } from "@/lib/format"
import { useAllProductsFull } from "@/features/products/hooks/useProducts"
import { VariantTransactionUomSelect } from "@/features/products/components/VariantTransactionUomSelect"
import { previewSalesItemPricing } from "../api/sales.api"
import { salesOrderFormSchema, type SalesOrderFormValues } from "../schemas/sales.schema"
import { useCreateSalesOrder, useSalesPriceLists } from "../hooks/useSales"
import { CustomerSelector } from "./CustomerSelector"

const EMPTY_ORDER_ITEMS: SalesOrderFormValues["items"] = []

/** Sales Order create form — customer, product line items, delivery date, payment terms, notes. */
export function SalesOrderForm() {
  const router = useRouter()
  const { data: products } = useAllProductsFull()
  const { data: priceLists = [] } = useSalesPriceLists()
  const createOrder = useCreateSalesOrder()
  const [pendingProductId, setPendingProductId] = useState("")
  const pricingContextRef = useRef<string>("")

  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderFormSchema),
    defaultValues: { customerId: "", priceListId: "", items: [], deliveryDate: "", paymentTerms: "", notes: "" },
  })

  const { fields, append, remove, update } = useFieldArray({ control: form.control, name: "items" })
  const watchedItems = useWatch({ control: form.control, name: "items" })
  const items = useMemo(() => watchedItems ?? EMPTY_ORDER_ITEMS, [watchedItems])
  const selectedPriceListId = useWatch({ control: form.control, name: "priceListId" }) ?? ""
  const deliveryDate = useWatch({ control: form.control, name: "deliveryDate" }) ?? ""
  const variantsById = useMemo(
    () =>
      new Map(
        (products ?? []).flatMap((product) => product.variants.map((variant) => [variant.id, variant] as const)),
      ),
    [products],
  )
  const requiresExplicitPriceList = priceLists.length !== 1

  useEffect(() => {
    if (priceLists.length === 1 && selectedPriceListId !== priceLists[0].id) {
      form.setValue("priceListId", priceLists[0].id, { shouldDirty: true })
      return
    }
    if (selectedPriceListId && !priceLists.some((entry) => entry.id === selectedPriceListId)) {
      form.setValue("priceListId", priceLists.length === 1 ? priceLists[0].id : "", { shouldDirty: true })
    }
  }, [form, priceLists, selectedPriceListId])

  const resolveLinePricing = useCallback(async (index: number, nextItem: SalesOrderFormValues["items"][number]) => {
    const effectivePriceListId = form.getValues("priceListId") || undefined
    if (requiresExplicitPriceList && !effectivePriceListId) {
      form.setError("priceListId", {
        type: "manual",
        message: "Select a sales price list before pricing line items.",
      })
      return
    }

    form.clearErrors("priceListId")
    try {
      const preview = await previewSalesItemPricing({
        productVariantId: nextItem.productId,
        quantity: nextItem.quantity,
        uomId: nextItem.uomId,
        priceListId: effectivePriceListId,
        transactionDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
      })

      update(index, {
        ...nextItem,
        uomId: preview.uomId ?? nextItem.uomId,
        uomLabel: preview.uomName ?? preview.uomCode ?? nextItem.uomLabel,
        price: preview.unitPrice,
      })
    } catch (error) {
      toastApiError(error, "Failed to resolve sales pricing")
    }
  }, [deliveryDate, form, requiresExplicitPriceList, update])

  useEffect(() => {
    const pricingContext = `${selectedPriceListId}|${deliveryDate}`
    if (pricingContextRef.current === pricingContext) {
      return
    }
    pricingContextRef.current = pricingContext
    if (items.length === 0) {
      return
    }

    void Promise.all(items.map((item, index) => resolveLinePricing(index, item)))
  }, [deliveryDate, items, resolveLinePricing, selectedPriceListId])

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    const discountTotal = items.reduce((sum, item) => sum + (item.discount || 0), 0)
    const taxTotal = items.reduce((sum, item) => sum + (item.tax || 0), 0)
    return { subtotal, discountTotal, taxTotal, grandTotal: subtotal - discountTotal + taxTotal }
  }, [items])

  async function handleAddProduct() {
    const product = (products ?? []).find((p) => p.variants.some((v) => v.id === pendingProductId))
    const variant = product?.variants.find((v) => v.id === pendingProductId)
    if (!product || !variant) return

    const effectivePriceListId = form.getValues("priceListId") || undefined
    if (requiresExplicitPriceList && !effectivePriceListId) {
      form.setError("priceListId", {
        type: "manual",
        message: "Select a sales price list before adding products.",
      })
      return
    }

    try {
      const preview = await previewSalesItemPricing({
        productVariantId: variant.id,
        quantity: 1,
        uomId: variant.baseUomId,
        priceListId: effectivePriceListId,
        transactionDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
      })

      form.clearErrors("priceListId")
      append({
        productId: variant.id,
        productName: product.name,
        sku: variant.sku,
        uomId: preview.uomId ?? variant.baseUomId,
        uomLabel: preview.uomName ?? preview.uomCode ?? variant.baseUom?.name ?? variant.baseUomId ?? "Base UOM",
        quantity: 1,
        price: preview.unitPrice,
        discount: 0,
        tax: 0,
      })
      setPendingProductId("")
    } catch (error) {
      toastApiError(error, "Failed to resolve sales pricing")
    }
  }

  function onSubmit(values: SalesOrderFormValues) {
    if (requiresExplicitPriceList && !values.priceListId) {
      form.setError("priceListId", {
        type: "manual",
        message: "Select a sales price list before creating this order.",
      })
      return
    }
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
              name="priceListId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sales Price List</FormLabel>
                  <FormControl>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={priceLists.length === 0 ? "No active price list" : "Select sales price list"} />
                      </SelectTrigger>
                      <SelectContent>
                        {priceLists.map((priceList) => (
                          <SelectItem key={priceList.id} value={priceList.id}>
                            {priceList.name} ({priceList.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {priceLists.length === 0 ? (
                    <p className="text-xs text-destructive">No active sales price list is available for this company.</p>
                  ) : null}
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
                    {(products ?? []).flatMap((product) =>
                      product.variants
                        .filter((variant) => variant.status === "active")
                        .map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {product.name} — {variant.sku}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddProduct}
                disabled={!pendingProductId || (requiresExplicitPriceList && !selectedPriceListId)}
              >
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
                      <TableHead>UOM</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Amount</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const item = items[index]
                    const variant = item ? variantsById.get(item.productId) : undefined
                    const amount = item ? item.quantity * item.price - (item.discount || 0) + (item.tax || 0) : 0
                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <p className="font-medium">{field.productName}</p>
                          <p className="font-mono text-xs text-muted-foreground">{field.sku}</p>
                        </TableCell>
                        <TableCell>
                          {variant && item ? (
                            <VariantTransactionUomSelect
                              variant={variant}
                              usage="SALES"
                              value={item.uomId}
                              onChange={(nextUomId, option) => {
                                const nextItem = {
                                  ...item,
                                  uomId: nextUomId,
                                  uomLabel: option.label,
                                  price: item.price,
                                }
                                update(index, nextItem)
                                void resolveLinePricing(index, nextItem)
                              }}
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field: qtyField }) => (
                              <FormItem>
                                <FormControl>
                                  <QuantityInput
                                    value={qtyField.value}
                                    onChange={(nextQuantity) => {
                                      qtyField.onChange(nextQuantity)
                                      if (!item) return
                                      void resolveLinePricing(index, {
                                        ...item,
                                        quantity: nextQuantity,
                                      })
                                    }}
                                    min={1}
                                  />
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
                            readOnly
                            className="w-24 bg-muted/40"
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
            {fields.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Line prices are resolved from the active sales price list using the selected UOM and delivery date.
              </p>
            ) : null}
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
          <Button type="submit" disabled={createOrder.isPending || (requiresExplicitPriceList && !selectedPriceListId)}>
            Create Sales Order
          </Button>
        </div>
      </form>
    </Form>
  )
}
