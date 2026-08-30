"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import { QuantityInput } from "@/components/inventory/QuantityInput"
import { ProductSelector } from "./ProductSelector"
import { useAllProductsFull } from "@/features/products/hooks/useProducts"
import { useSuppliers } from "../hooks/useSuppliers"
import { usePurchaseRequest } from "../hooks/usePurchaseOrders"
import { useCreatePurchaseRfq } from "../hooks/useProcurement"
import {
  purchaseRfqFormSchema,
  type PurchaseRfqFormValues,
} from "../schemas/procurement.schema"

function toDateInputValue(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

export function PurchaseRfqForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get("requestId") ?? undefined
  const { data: purchaseRequest } = usePurchaseRequest(requestId)
  const { data: suppliers } = useSuppliers()
  const { data: products } = useAllProductsFull()
  const createRfq = useCreatePurchaseRfq()
  const [pendingProductId, setPendingProductId] = useState("")
  const [pendingReason, setPendingReason] = useState("")
  const [prefilledRequestId, setPrefilledRequestId] = useState<string | null>(null)

  const form = useForm<PurchaseRfqFormValues>({
    resolver: zodResolver(purchaseRfqFormSchema),
    defaultValues: {
      purchaseRequestId: "",
      title: "",
      requiredDate: "",
      invitedSupplierIds: [],
      items: [],
      notes: "",
    },
  })

  const { fields, append, remove, replace, update } = useFieldArray({
    control: form.control,
    name: "items",
  })
  const invitedSupplierIds = form.watch("invitedSupplierIds")
  const items = form.watch("items")

  useEffect(() => {
    if (!purchaseRequest || !products || prefilledRequestId === purchaseRequest.id) return

    replace(
      purchaseRequest.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        reason: item.reason,
      })),
    )
    form.setValue("purchaseRequestId", purchaseRequest.id)
    form.setValue("title", `RFQ for ${purchaseRequest.reference}`)
    form.setValue("requiredDate", toDateInputValue(purchaseRequest.requiredDate))
    setPrefilledRequestId(purchaseRequest.id)
  }, [form, prefilledRequestId, products, purchaseRequest, replace])

  function handleAddProduct() {
    const product = (products ?? []).find((entry) => entry.variants.some((variant) => variant.id === pendingProductId))
    const variant = product?.variants.find((entry) => entry.id === pendingProductId)
    if (!product || !variant || !pendingReason.trim()) return
    append({
      productId: variant.id,
      productName: product.name,
      sku: variant.sku,
      quantity: 1,
      reason: pendingReason.trim(),
    })
    setPendingProductId("")
    setPendingReason("")
  }

  function toggleSupplier(supplierId: string, checked: boolean) {
    const next = checked
      ? Array.from(new Set([...(invitedSupplierIds ?? []), supplierId]))
      : (invitedSupplierIds ?? []).filter((entry) => entry !== supplierId)
    form.setValue("invitedSupplierIds", next, { shouldValidate: true })
  }

  function onSubmit(values: PurchaseRfqFormValues) {
    createRfq.mutate(values, {
      onSuccess: (rfq) => {
        router.push(`/dashboard/purchase/rfq?rfqId=${rfq.id}`)
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        {purchaseRequest ? (
          <Card>
            <CardContent className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Creating RFQ from {purchaseRequest.reference}</p>
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
            <CardTitle className="text-base">RFQ Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="RFQ title" {...field} />
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
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Commercial or delivery notes" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invited Suppliers</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {(suppliers ?? []).map((supplier) => (
              <label key={supplier.id} className="flex items-start gap-3 rounded-xl border p-3">
                <Checkbox
                  checked={(invitedSupplierIds ?? []).includes(supplier.id)}
                  onCheckedChange={(checked) => toggleSupplier(supplier.id, checked === true)}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{supplier.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {supplier.code} | {supplier.contactPerson || "No contact"}
                  </p>
                </div>
              </label>
            ))}
            {form.formState.errors.invitedSupplierIds?.message ? (
              <p className="text-sm text-destructive sm:col-span-2">{form.formState.errors.invitedSupplierIds.message}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">RFQ Items</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2 md:grid-cols-[1fr,1fr,auto]">
              <ProductSelector value={pendingProductId} onChange={setPendingProductId} />
              <Input value={pendingReason} onChange={(event) => setPendingReason(event.target.value)} placeholder="Why is this item needed?" />
              <Button type="button" variant="outline" onClick={handleAddProduct} disabled={!pendingProductId || !pendingReason.trim()}>
                <Plus /> Add Item
              </Button>
            </div>

            {fields.length === 0 ? (
              <EmptyState title="No RFQ items" description="Add at least one item to send to suppliers." />
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
                  {fields.map((field, index) => {
                    const item = items[index]
                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <p className="font-medium">{field.productName}</p>
                          <p className="font-mono text-xs text-muted-foreground">{field.sku}</p>
                        </TableCell>
                        <TableCell>
                          <QuantityInput
                            value={item?.quantity ?? 1}
                            onChange={(value) => update(index, { ...field, quantity: value, reason: item?.reason ?? field.reason })}
                            min={1}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item?.reason ?? field.reason}
                            onChange={(event) =>
                              update(index, {
                                ...field,
                                quantity: item?.quantity ?? field.quantity,
                                reason: event.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button type="button" size="icon" variant="ghost" onClick={() => remove(index)} aria-label="Remove RFQ item">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
            {form.formState.errors.items?.message ? (
              <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createRfq.isPending}>
            Create RFQ
          </Button>
        </div>
      </form>
    </Form>
  )
}
