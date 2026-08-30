"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/format"
import { useSuppliers } from "../hooks/useSuppliers"
import {
  useCreateSupplierQuotation,
  usePurchaseRfq,
  usePurchaseRfqs,
  useSupplierQuotations,
  useUpdatePurchaseRfqStatus,
  useUpdateSupplierQuotationStatus,
} from "../hooks/useProcurement"
import {
  supplierQuotationFormSchema,
  type SupplierQuotationFormValues,
} from "../schemas/procurement.schema"
import type { RequestForQuotationStatus, SupplierQuotationStatus } from "../types"

function statusTone(status: string) {
  switch (status) {
    case "awarded":
    case "closed":
      return "default"
    case "cancelled":
    case "rejected":
      return "destructive"
    default:
      return "secondary"
  }
}

function SupplierQuotationEntryForm({ rfqId }: { rfqId: string }) {
  const { data: rfq } = usePurchaseRfq(rfqId)
  const { data: suppliers } = useSuppliers()
  const createQuotation = useCreateSupplierQuotation()

  const invitedSuppliers = useMemo(
    () => (suppliers ?? []).filter((supplier) => (rfq?.invitedSupplierIds ?? []).includes(supplier.id)),
    [rfq?.invitedSupplierIds, suppliers],
  )

  const form = useForm<SupplierQuotationFormValues>({
    resolver: zodResolver(supplierQuotationFormSchema),
    defaultValues: {
      purchaseRfqId: rfqId,
      supplierId: "",
      paymentTermId: "",
      leadTimeDays: 0,
      notes: "",
      items: [],
    },
  })

  const { fields, replace, update } = useFieldArray({
    control: form.control,
    name: "items",
  })
  const items = form.watch("items")

  useEffect(() => {
    if (!rfq) return
    form.setValue("purchaseRfqId", rfq.id)
    replace(
      rfq.items.map((item) => ({
        purchaseRfqItemId: item.id,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitCost: 0,
        discount: 0,
        tax: 0,
      })),
    )
  }, [form, replace, rfq])

  function handleSupplierChange(supplierId: string) {
    const supplier = invitedSuppliers.find((entry) => entry.id === supplierId)
    form.setValue("supplierId", supplierId)
    form.setValue("paymentTermId", supplier?.paymentTermId ?? "")
  }

  function onSubmit(values: SupplierQuotationFormValues) {
    createQuotation.mutate(values, {
      onSuccess: () => {
        form.reset({
          purchaseRfqId: rfqId,
          supplierId: "",
          paymentTermId: "",
          leadTimeDays: 0,
          notes: "",
          items: (rfq?.items ?? []).map((item) => ({
            purchaseRfqItemId: item.id,
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            unitCost: 0,
            discount: 0,
            tax: 0,
          })),
        })
      },
    })
  }

  if (!rfq) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Supplier Quotation</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select value={field.value} onValueChange={handleSupplierChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select invited supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {invitedSuppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} ({supplier.code})
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
                name="leadTimeDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Time (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value ?? 0}
                        onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Commercial notes" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const item = items[index]
                  const amount = (item?.quantity ?? 0) * (item?.unitCost ?? 0) - (item?.discount ?? 0) + (item?.tax ?? 0)
                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <p className="font-medium">{field.productName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{field.sku}</p>
                      </TableCell>
                      <TableCell>{field.quantity}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item?.unitCost ?? 0}
                          onChange={(event) => update(index, { ...field, ...item, unitCost: Number(event.target.value) || 0 })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item?.discount ?? 0}
                          onChange={(event) => update(index, { ...field, ...item, discount: Number(event.target.value) || 0 })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item?.tax ?? 0}
                          onChange={(event) => update(index, { ...field, ...item, tax: Number(event.target.value) || 0 })}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(amount)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <Button type="submit" disabled={createQuotation.isPending}>
                Save Quotation
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export function PurchaseRfqWorkspace() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRfqId = searchParams.get("rfqId") ?? undefined
  const { data: rfqs, isLoading, isError, refetch } = usePurchaseRfqs()
  const { data: suppliers } = useSuppliers()
  const [selectedRfqId, setSelectedRfqId] = useState<string | undefined>(initialRfqId)

  useEffect(() => {
    if (initialRfqId) {
      setSelectedRfqId(initialRfqId)
      return
    }
    if (!selectedRfqId && rfqs && rfqs.length > 0) {
      setSelectedRfqId(rfqs[0].id)
    }
  }, [initialRfqId, rfqs, selectedRfqId])

  const { data: rfq } = usePurchaseRfq(selectedRfqId)
  const { data: quotations } = useSupplierQuotations(selectedRfqId)
  const updateRfqStatus = useUpdatePurchaseRfqStatus()
  const updateQuotationStatus = useUpdateSupplierQuotationStatus()

  const suppliersById = useMemo(
    () => new Map((suppliers ?? []).map((supplier) => [supplier.id, supplier])),
    [suppliers],
  )

  function mutateRfqStatus(status: RequestForQuotationStatus) {
    if (!selectedRfqId) return
    updateRfqStatus.mutate({ id: selectedRfqId, status })
  }

  function mutateQuotationStatus(id: string, status: SupplierQuotationStatus) {
    updateQuotationStatus.mutate({ id, status })
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
        <Skeleton className="h-[420px] w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load RFQ workspace." onRetry={refetch} />

  if (!rfqs || rfqs.length === 0) {
    return <EmptyState title="No RFQs yet" description="Create an RFQ to compare supplier quotations here." />
  }

  const awardedQuotation = (quotations ?? []).find((quotation) => quotation.status === "awarded")

  return (
    <div className="grid gap-4 xl:grid-cols-[320px,1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open RFQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rfqs.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedRfqId(entry.id)}
              className={`w-full rounded-xl border p-3 text-left transition ${selectedRfqId === entry.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{entry.rfqNumber}</p>
                <Badge variant={statusTone(entry.status)}>{entry.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{entry.title}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {entry.items.length} item(s) | {new Date(entry.requiredDate).toLocaleDateString()}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      {!rfq ? (
        <EmptyState title="Select an RFQ" description="Choose an RFQ from the left to manage quotations." />
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-base">{rfq.rfqNumber} · {rfq.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Required by {new Date(rfq.requiredDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusTone(rfq.status)}>{rfq.status}</Badge>
                {rfq.status === "draft" ? (
                  <Button size="sm" onClick={() => mutateRfqStatus("sent")} disabled={updateRfqStatus.isPending}>
                    Mark Sent
                  </Button>
                ) : null}
                {rfq.status === "sent" ? (
                  <Button size="sm" variant="outline" onClick={() => mutateRfqStatus("closed")} disabled={updateRfqStatus.isPending}>
                    Close RFQ
                  </Button>
                ) : null}
                {rfq.status !== "closed" && rfq.status !== "cancelled" ? (
                  <Button size="sm" variant="ghost" onClick={() => mutateRfqStatus("cancelled")} disabled={updateRfqStatus.isPending}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Invited suppliers</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {rfq.invitedSupplierIds.map((supplierId) => (
                    <Badge key={supplierId} variant="outline">
                      {suppliersById.get(supplierId)?.name ?? supplierId}
                    </Badge>
                  ))}
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfq.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.productName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quotation Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {!quotations || quotations.length === 0 ? (
                <EmptyState title="No quotations yet" description="Suppliers have not submitted prices for this RFQ yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Lead Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell>
                          <p className="font-medium">{suppliersById.get(quotation.supplierId)?.name ?? quotation.supplierId}</p>
                          <p className="font-mono text-xs text-muted-foreground">{quotation.quotationNumber}</p>
                        </TableCell>
                        <TableCell>{quotation.leadTimeDays ?? 0} day(s)</TableCell>
                        <TableCell>
                          <Badge variant={statusTone(quotation.status)}>{quotation.status}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(quotation.grandTotal)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {quotation.status === "submitted" ? (
                              <>
                                <Button size="sm" onClick={() => mutateQuotationStatus(quotation.id, "awarded")} disabled={updateQuotationStatus.isPending}>
                                  Award
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => mutateQuotationStatus(quotation.id, "rejected")} disabled={updateQuotationStatus.isPending}>
                                  Reject
                                </Button>
                              </>
                            ) : null}
                            {quotation.status === "awarded" ? (
                              <Button size="sm" variant="secondary" onClick={() => router.push(`/dashboard/purchase/orders/create?quotationId=${quotation.id}`)}>
                                Create PO
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {rfq.status !== "cancelled" && !awardedQuotation ? (
            <SupplierQuotationEntryForm rfqId={rfq.id} />
          ) : null}
        </div>
      )}
    </div>
  )
}
