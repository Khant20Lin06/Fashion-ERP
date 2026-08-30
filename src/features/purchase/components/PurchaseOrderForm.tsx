"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { useCreatePurchaseOrder, usePurchaseRequest, useUpdatePurchaseRequestStatus } from "../hooks/usePurchaseOrders"
import { useSupplierQuotation } from "../hooks/useProcurement"
import { purchaseOrderFormSchema, type PurchaseOrderFormValues } from "../schemas/purchase.schema"
import { ProductSelector } from "./ProductSelector"
import { useAllProductsFull } from "@/features/products/hooks/useProducts"
import { VariantTransactionUomSelect } from "@/features/products/components/VariantTransactionUomSelect"

function toDateInputValue(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

/** Purchase Order create form - supplier info, product line items, and request conversion prefill. */
export function PurchaseOrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get("requestId") ?? undefined
  const quotationId = searchParams.get("quotationId") ?? undefined
  const { data: suppliers } = useSuppliers()
  const { data: products } = useAllProductsFull()
  const { data: supplierQuotation } = useSupplierQuotation(quotationId)
  const effectiveRequestId = requestId ?? supplierQuotation?.rfq?.purchaseRequestId ?? undefined
  const { data: purchaseRequest } = usePurchaseRequest(effectiveRequestId)
  const createOrder = useCreatePurchaseOrder()
  const convertRequest = useUpdatePurchaseRequestStatus()
  const [pendingProductId, setPendingProductId] = useState("")
  const [prefilledRequestId, setPrefilledRequestId] = useState<string | null>(null)
  const [prefilledQuotationId, setPrefilledQuotationId] = useState<string | null>(null)

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      supplierId: "",
      paymentTermId: "",
      sourceSupplierQuotationId: "",
      contact: "",
      paymentTerms: "",
      deliveryDate: "",
      items: [],
    },
  })

  const { fields, append, remove, replace, update } = useFieldArray({ control: form.control, name: "items" })
  const supplierId = form.watch("supplierId")
  const items = form.watch("items")
  const selectedSupplier = (suppliers ?? []).find((supplier) => supplier.id === supplierId)
  const variantsById = useMemo(
    () =>
      new Map(
        (products ?? []).flatMap((product) => product.variants.map((variant) => [variant.id, variant] as const)),
      ),
    [products],
  )

  useEffect(() => {
    if (!supplierQuotation || prefilledQuotationId === supplierQuotation.id) return

    const supplier = (suppliers ?? []).find((entry) => entry.id === supplierQuotation.supplierId)
    replace(
      supplierQuotation.items.map((item) => {
        const variant = variantsById.get(item.productId)
        return {
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          uomId: variant?.baseUomId,
          uomLabel: variant?.baseUom?.name ?? variant?.baseUomId ?? "Base UOM",
          quantity: item.quantity,
          unitCost: item.unitCost,
          discount: item.discount,
          tax: item.tax,
        }
      }),
    )
    form.setValue("supplierId", supplierQuotation.supplierId)
    form.setValue("paymentTermId", supplierQuotation.paymentTermId ?? supplier?.paymentTermId ?? "")
    form.setValue("sourceSupplierQuotationId", supplierQuotation.id)
    form.setValue("contact", supplier?.contactPerson ?? "")
    form.setValue("paymentTerms", supplier?.paymentTerms ?? "")
    form.setValue("deliveryDate", toDateInputValue(supplierQuotation.rfq?.requiredDate ?? ""))
    setPrefilledQuotationId(supplierQuotation.id)
  }, [form, prefilledQuotationId, replace, supplierQuotation, suppliers, variantsById])

  useEffect(() => {
    if (!purchaseRequest || !products || supplierQuotation || prefilledRequestId === purchaseRequest.id) return

    replace(
      purchaseRequest.items.map((item) => {
        const product = products.find((entry) => entry.variants.some((variant) => variant.id === item.productId))
        const variant = product?.variants.find((entry) => entry.id === item.productId)
        return {
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          uomId: variant?.baseUomId,
          uomLabel: variant?.baseUom?.name ?? variant?.baseUomId ?? "Base UOM",
          quantity: item.quantity,
          unitCost: variant?.costPrice ?? 0,
          discount: 0,
          tax: 0,
        }
      }),
    )
    form.setValue("deliveryDate", toDateInputValue(purchaseRequest.requiredDate))
    setPrefilledRequestId(purchaseRequest.id)
  }, [form, prefilledRequestId, products, purchaseRequest, replace])

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
    const discountTotal = items.reduce((sum, item) => sum + (item.discount || 0), 0)
    const taxTotal = items.reduce((sum, item) => sum + (item.tax || 0), 0)
    return { subtotal, discountTotal, taxTotal, grandTotal: subtotal - discountTotal + taxTotal }
  }, [items])

  function handleSupplierChange(id: string) {
    const supplier = (suppliers ?? []).find((entry) => entry.id === id)
    form.setValue("supplierId", id)
    form.setValue("paymentTermId", supplier?.paymentTermId ?? "")
    form.setValue("contact", supplier?.contactPerson ?? "")
    form.setValue("paymentTerms", supplier?.paymentTerms ?? "")
  }

  function handleAddProduct() {
    const product = (products ?? []).find((entry) => entry.variants.some((variant) => variant.id === pendingProductId))
    const variant = product?.variants.find((entry) => entry.id === pendingProductId)
    if (!product || !variant) return
    append({
      productId: variant.id,
      productName: product.name,
      sku: variant.sku,
      uomId: variant.baseUomId,
      uomLabel: variant.baseUom?.name ?? variant.baseUomId ?? "Base UOM",
      quantity: 1,
      unitCost: variant.costPrice,
      discount: 0,
      tax: 0,
    })
    setPendingProductId("")
  }

  function finishAfterCreate() {
    if (effectiveRequestId && purchaseRequest && purchaseRequest.status !== "converted") {
      convertRequest.mutate(
        { id: effectiveRequestId, status: "converted" },
        { onSettled: () => router.push("/dashboard/purchase/orders") },
      )
      return
    }
    router.push("/dashboard/purchase/orders")
  }

  function onSubmit(values: PurchaseOrderFormValues) {
    createOrder.mutate(values, {
      onSuccess: () => finishAfterCreate(),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        {supplierQuotation ? (
          <Card>
            <CardContent className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Creating PO from awarded quotation {supplierQuotation.quotationNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {supplierQuotation.rfq?.rfqNumber} | {supplierQuotation.rfq?.title}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Required by {supplierQuotation.rfq?.requiredDate ? new Date(supplierQuotation.rfq.requiredDate).toLocaleDateString() : "-"}
              </p>
            </CardContent>
          </Card>
        ) : null}
        {purchaseRequest ? (
          <Card>
            <CardContent className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Converting Purchase Request {purchaseRequest.reference}</p>
                <p className="text-sm text-muted-foreground">
                  {purchaseRequest.department} | Requested by {purchaseRequest.requester}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Required by {new Date(purchaseRequest.requiredDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ) : null}

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
                {selectedSupplier?.contactPerson ?? "-"}
              </div>
            </FormItem>
            <FormItem>
              <FormLabel>Payment Terms</FormLabel>
              <div className="flex h-8 items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
                {selectedSupplier?.paymentTerms ?? "-"}
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

        <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Phase 5A control: newly created purchase orders start as drafts. Confirm the PO before receiving goods or
          treating the document as execution-ready.
        </div>

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
                      <TableHead>UOM</TableHead>
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
                    const variant = item ? variantsById.get(item.productId) : undefined
                    const amount = item ? item.quantity * item.unitCost - (item.discount || 0) + (item.tax || 0) : 0
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
                              usage="PURCHASE"
                              value={item.uomId}
                              onChange={(nextUomId, option) =>
                                update(index, {
                                  ...item,
                                  uomId: nextUomId,
                                  uomLabel: option.label,
                                  unitCost: Number((variant.costPrice * option.factor).toFixed(2)),
                                })
                              }
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
            {fields.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Purchase quantity stays in the chosen UOM, while the backend converts stock into the variant base UOM
                during goods receipt posting.
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
          <Button type="submit" disabled={createOrder.isPending || convertRequest.isPending}>
            Create Draft PO
          </Button>
        </div>
      </form>
    </Form>
  )
}
