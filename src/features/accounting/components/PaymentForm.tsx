"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { MoneyInput } from "@/components/accounting/MoneyInput"
import { PaymentMethodSelector } from "@/components/accounting/PaymentMethodSelector"
import { financePaymentFormSchema, type FinancePaymentFormValues } from "../schemas/payment.schema"
import { useCreateFinancePayment } from "../hooks/usePayments"

/** Payment Management form — Payment Type, Customer/Supplier, Reference, Amount, Method, Date. */
export function PaymentForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const createPayment = useCreateFinancePayment()

  const form = useForm<FinancePaymentFormValues>({
    resolver: zodResolver(financePaymentFormSchema),
    defaultValues: {
      direction: "outgoing",
      partyName: "",
      relatedReference: "",
      amount: 0,
      method: "bank_transfer",
      date: new Date().toISOString().slice(0, 10),
    },
  })

  function onSubmit(values: FinancePaymentFormValues) {
    createPayment.mutate(values, {
      onSuccess: () => {
        form.reset({
          direction: "outgoing",
          partyName: "",
          relatedReference: "",
          amount: 0,
          method: "bank_transfer",
          date: new Date().toISOString().slice(0, 10),
        })
        onSubmitted?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="incoming">Receive from Customer</SelectItem>
                      <SelectItem value="outgoing">Pay to Supplier</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="partyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer / Supplier</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="relatedReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="Invoice/PO number" className="font-mono" {...field} />
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
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <MoneyInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <PaymentMethodSelector value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
