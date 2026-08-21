"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SupplierSelector } from "@/components/purchase/SupplierSelector"
import { formatCurrency } from "@/lib/format"
import { paymentFormSchema, type PaymentFormValues } from "../schemas/payment.schema"
import { useCreatePayment, usePaymentMethods } from "../hooks/usePayments"
import { usePurchaseOrders } from "../hooks/usePurchaseOrders"

/** Supplier Payment form — pay against an outstanding purchase order. */
export function PaymentForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { data: purchaseOrders } = usePurchaseOrders()
  const { data: paymentMethods } = usePaymentMethods()
  const createPayment = useCreatePayment()

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      supplierId: "",
      purchaseOrderId: "",
      paymentMethodId: "",
      paymentDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      referenceNumber: "",
      notes: "",
    },
  })

  const supplierId = form.watch("supplierId")
  const purchaseOrderId = form.watch("purchaseOrderId")
  const supplierPurchaseOrders = (purchaseOrders ?? []).filter(
    (order) => order.supplierId === supplierId && order.status !== "cancelled"
  )
  const selectedOrder = (purchaseOrders ?? []).find((o) => o.id === purchaseOrderId)
  const outstandingOnOrder = selectedOrder ? selectedOrder.grandTotal : undefined

  function onSubmit(values: PaymentFormValues) {
    createPayment.mutate(values, {
      onSuccess: () => {
        form.reset({
          supplierId: "",
          purchaseOrderId: "",
          paymentMethodId: "",
          paymentDate: new Date().toISOString().slice(0, 10),
          amount: 0,
          referenceNumber: "",
          notes: "",
        })
        onSubmitted?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supplier Payment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <SupplierSelector
                      value={field.value}
                      onChange={(id) => {
                        field.onChange(id)
                        form.setValue("purchaseOrderId", "")
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Order</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!supplierId}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={supplierId ? "Select purchase order" : "Select a supplier first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supplierPurchaseOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.poNumber} — {formatCurrency(order.grandTotal)}
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
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount{outstandingOnOrder !== undefined ? ` (${formatCurrency(outstandingOnOrder)} order total)` : ""}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(paymentMethods ?? []).map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
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
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Transaction/reference number" {...field} />
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
                    <Textarea placeholder="Additional notes…" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createPayment.isPending}>
            Record Payment
          </Button>
        </div>
      </form>
    </Form>
  )
}
